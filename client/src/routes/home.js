import Sections from '../bricks/sections';

function Home() {
    return (
        <div className="App">
            <header className="App-header">
                Recipe Manager
            </header>
            <header className="Dashboard-header">
                Dashboard
            </header>
            <div className="Section-container">
                <Sections />
            </div>
        </div>
    );
}

export default Home;