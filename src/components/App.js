import "../css/App.css";
import Header from "./Header";
import MapSearch from "./Mapsearch";
import { useEffect } from "react";

function App(props) {
  useEffect(() => {
    console.log("hi");
  }, []);

  return (
    <article className="App">
      <Header />
      <MapSearch />
    </article>
  );
}

export default App;
