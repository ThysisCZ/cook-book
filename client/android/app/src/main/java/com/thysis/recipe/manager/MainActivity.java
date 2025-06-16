package com.thysis.recipe.manager;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.ConnectionResult;
import android.content.pm.PackageInfo;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.initialization.AdapterStatus;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.UnityAds;

import java.util.Locale;
import java.util.Map;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "AdDebug";
    private AdView adView;
    private static final String UNITY_GAME_ID = "5878379";
    private static final boolean UNITY_TEST_MODE = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Unity Ads
        UnityAds.initialize(this, UNITY_GAME_ID, UNITY_TEST_MODE, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {
                Log.i(TAG, "Unity Ads initialization complete");
            }

            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
                Log.e(TAG, "Unity Ads initialization failed: [" + error + "] " + message);
            }
        });

        // Inflate custom layout with proper root
        View rootView = getLayoutInflater().inflate(R.layout.activity_main,
                getWindow().getDecorView().findViewById(android.R.id.content), false);
        setContentView(rootView);

        // Add Capacitor WebView to container safely
        FrameLayout container = rootView.findViewById(R.id.webview_container);
        View webView = getBridge().getWebView();
        if (webView.getParent() != null) {
            ((ViewGroup) webView.getParent()).removeView(webView);
        }
        container.addView(webView);

        // Check Google Play Services availability and version
        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = googleApiAvailability.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            String errorString = googleApiAvailability.getErrorString(resultCode);
            Log.e(TAG, "Google Play Services not available: " + errorString);
            Toast.makeText(this, "Google Play Services required for ads: " + errorString, Toast.LENGTH_LONG).show();

            // Try to resolve the error
            if (googleApiAvailability.isUserResolvableError(resultCode)) {
                android.app.Dialog errorDialog = googleApiAvailability.getErrorDialog(this, resultCode, 2404);
                if (errorDialog != null) {
                    errorDialog.show();
                } else {
                    Log.e(TAG, "Could not show Google Play Services error dialog");
                }
            }
            return;
        } else {
            // Log Google Play Services version
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo("com.google.android.gms", 0);
                Log.i(TAG, "Google Play Services version: " + pInfo.versionName);
            } catch (Exception e) {
                Log.e(TAG, "Could not get Google Play Services version: " + e.getMessage());
            }
        }

        // Initialize Mobile Ads SDK with detailed logging
        MobileAds.initialize(this, initializationStatus -> {
            Log.i(TAG, "Mobile Ads SDK initialized.");
            // Log initialization status details
            if (initializationStatus.getAdapterStatusMap().isEmpty()) {
                Log.e(TAG, "No adapters initialized. This might indicate a problem with Google Play Services.");
                Toast.makeText(this, "Ad initialization failed. Please check Google Play Services.", Toast.LENGTH_LONG)
                        .show();
                return;
            }

            // Use entrySet() instead of forEach for better compatibility
            for (Map.Entry<String, AdapterStatus> entry : initializationStatus.getAdapterStatusMap().entrySet()) {
                AdapterStatus status = entry.getValue();
                Log.d(TAG, String.format(Locale.US, "Adapter: %s, Status: %s, Description: %s",
                        entry.getKey(), status.getInitializationState(), status.getDescription()));
            }

            // After initialization, set up the ad
            setupBannerAd(rootView);
        });
    }

    private void setupBannerAd(@NonNull View rootView) {
        // Assign adView field (not local variable)
        adView = rootView.findViewById(R.id.adView);
        if (adView != null) {
            Log.d(TAG, "AdView found in layout");

            // Ensure the ad view is properly measured
            adView.post(() -> {
                // Build ad request with additional parameters for better fill rate
                AdRequest adRequest = new AdRequest.Builder()
                        .build();

                // Set detailed ad listener
                adView.setAdListener(new AdListener() {
                    @Override
                    public void onAdLoaded() {
                        Log.i(TAG, "Ad loaded successfully. Ad is now visible: " + adView.isShown());
                        // Force layout refresh
                        adView.requestLayout();
                        // Make sure the ad is visible
                        adView.setVisibility(View.VISIBLE);
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError adError) {
                        String errorMessage = String.format(Locale.US,
                                "Ad failed to load. Error code: %d, Message: %s, Domain: %s",
                                adError.getCode(), adError.getMessage(), adError.getDomain());
                        Log.e(TAG, errorMessage);

                        // Log additional details about the error
                        if (adError.getResponseInfo() != null) {
                            Log.e(TAG, "Response Info: " + adError.getResponseInfo());
                        }

                        // Handle specific error cases
                        switch (adError.getCode()) {
                            case AdRequest.ERROR_CODE_NO_FILL:
                                Log.w(TAG, "No ad fill available. This is normal for new ad units or during testing.");
                                // Retry loading after a delay
                                retryAdLoad(adRequest, 30000); // Retry after 30 seconds
                                break;
                            case AdRequest.ERROR_CODE_INTERNAL_ERROR:
                                Toast.makeText(MainActivity.this,
                                        "Internal error loading ad. Please check your internet connection.",
                                        Toast.LENGTH_SHORT).show();
                                // Retry after a shorter delay for internal errors
                                retryAdLoad(adRequest, 15000); // Retry after 15 seconds
                                break;
                            case AdRequest.ERROR_CODE_INVALID_REQUEST:
                                Log.e(TAG, "Invalid ad request. Please check your ad unit ID and configuration.");
                                // Retry with a delay
                                retryAdLoad(adRequest, 5000); // Retry after 5 seconds
                                break;
                            default:
                                Log.e(TAG, "Unknown error loading ad: " + adError.getCode());
                                // Retry for unknown errors
                                retryAdLoad(adRequest, 10000); // Retry after 10 seconds
                        }
                    }

                    @Override
                    public void onAdOpened() {
                        Log.d(TAG, "Ad opened");
                    }

                    @Override
                    public void onAdClosed() {
                        Log.d(TAG, "Ad closed");
                        // Try to load the next ad when the current one is closed
                        adView.loadAd(adRequest);
                    }
                });

                // Load the ad
                Log.d(TAG, "Requesting ad for unit ID: " + adView.getAdUnitId());
                adView.loadAd(adRequest);
            });
        } else {
            Log.e(TAG, "AdView is null. Check your layout file.");
            Toast.makeText(this, "Ad view not found in layout", Toast.LENGTH_LONG).show();
        }
    }

    private void retryAdLoad(AdRequest adRequest, long delayMillis) {
        if (adView != null) {
            adView.postDelayed(() -> {
                Log.d(TAG, "Retrying ad load after " + delayMillis + "ms delay...");
                // Make sure the view is still valid
                if (adView != null && !isFinishing()) {
                    adView.loadAd(adRequest);
                }
            }, delayMillis);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Try to load an ad when the activity resumes
        if (adView != null) {
            adView.loadAd(new AdRequest.Builder().build());
        }
    }

    @Override
    public void onPause() {
        if (adView != null) {
            adView.pause();
        }
        super.onPause();
    }

    @Override
    public void onDestroy() {
        if (adView != null) {
            adView.destroy();
        }
        super.onDestroy();
    }
}
