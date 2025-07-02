import Sections from '../bricks/sections';
import { useLanguage } from '../contexts/languageContext';
import ReactCountryFlag from "react-country-flag";

function Home() {
    const { isCzech, setIsCzech } = useLanguage();

    return (
        <div className="App">
            <header className="App-header">
                <div className="d-flex justify-content-between">
                    <div
                        style={{
                            width: '1.5em',
                            height: '1.5em',
                        }}
                    ></div>

                    <div>
                        {isCzech ? "Kuchařka" : "Recipe Manager"}
                    </div>

                    <div>
                        <ReactCountryFlag
                            countryCode={isCzech ? "US" : "CZ"}
                            svg
                            style={{
                                width: '1.5em',
                                height: '1.5em',
                                marginBottom: 2
                            }}
                            title={isCzech ? "US" : "CZ"}
                            onClick={() => {
                                if (isCzech) {
                                    setIsCzech(false);
                                } else {
                                    setIsCzech(true);
                                }
                            }}
                        />
                    </div>
                </div>
            </header >
            <header className="Dashboard-header">
                {isCzech ? "Přehledový Panel" : "Dashboard"}
            </header>
            <div className="Section-container">
                <Sections
                    isCzech={isCzech}
                />
            </div>
        </div>
    );
}

export default Home;