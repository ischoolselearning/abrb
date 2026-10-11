import { useEffect } from "react";
import "../css/App.css";
import Header from "./Header";
import MapSearch from "./Mapsearch";

const App: React.FC = () => {
  return (
    <article className="App">
      <Header />
      <MapSearch />
    </article>
  );
};

export default App;
