package io.ionic.recipemanager;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.LoadAdError;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "AdDebug";
    private AdView adView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inflate custom layout
        View rootView = getLayoutInflater().inflate(R.layout.activity_main, null);
        setContentView(rootView);

        // Add Capacitor WebView to container safely
        FrameLayout container = rootView.findViewById(R.id.webview_container);
        View webView = getBridge().getWebView();
        if (webView.getParent() != null) {
            ((ViewGroup) webView.getParent()).removeView(webView);
        }
        container.addView(webView);

        // Initialize Mobile Ads SDK
        MobileAds.initialize(this, initializationStatus -> Log.i(TAG, "Mobile Ads SDK initialized."));

        // Assign adView field (not local variable)
        adView = rootView.findViewById(R.id.adView);
        if (adView != null) {
            AdRequest adRequest = new AdRequest.Builder().build();
            adView.loadAd(adRequest);
            adView.setAdListener(new AdListener() {
                @Override
                public void onAdLoaded() {
                    Log.i(TAG, "Ad loaded successfully.");
                }

                @Override
                public void onAdFailedToLoad(LoadAdError adError) {
                    Log.e(TAG, "Ad failed to load: " + adError.getMessage());
                }
            });
        } else {
            Log.e(TAG, "AdView is null. Check your layout file.");
        }
    }
}