import { useState, useEffect, useRef } from "react";

import "../css/searchBox.css";

export default function SearchBox({ onPick, geocodeUrl, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | empty | error
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);
  const wrapRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("loading");
      try {
        const url = `${geocodeUrl}?format=jsonv2&limit=6&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": navigator.language || "en" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const mapped = data.map((d) => ({
          id: d.place_id,
          name: d.name || d.display_name.split(",")[0],
          address: d.display_name,
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          bounds: d.boundingbox
            ? [
                [parseFloat(d.boundingbox[0]), parseFloat(d.boundingbox[2])],
                [parseFloat(d.boundingbox[1]), parseFloat(d.boundingbox[3])],
              ]
            : null,
        }));
        setResults(mapped);
        setActive(mapped.length ? 0 : -1);
        setStatus(mapped.length ? "idle" : "empty");
        setOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") setStatus("error");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, geocodeUrl]);

  // Close the list when clicking outside
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = (place) => {
    setQuery(place.name);
    setOpen(false);
    onPick(place);
  };

  const onKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList =
    open && (results.length > 0 || status === "empty" || status === "error");

  return (
    <div className="searchBox" ref={wrapRef}>
      <style>{styles}</style>
      <div className="searchBox__container">
        <svg className="searchBox__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="11"
            cy="11"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 20l-4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls="searchBox__resultsList"
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `searchBox__resultsList__item-${active}` : undefined
          }
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {status === "loading" && (
          <span className="searchBox__spinner" aria-label="Searching" />
        )}
        {query && status !== "loading" && (
          <button
            className="searchBox__clearButton"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
              setStatus("idle");
            }}
          >
            ×
          </button>
        )}
      </div>

      {showList && (
        <ul
          id="searchBox__resultsList"
          className="searchBox__resultsList"
          role="listbox"
        >
          {status === "error" && (
            <li className="searchBox__resultsList__noteItem">
              Search is unavailable. Check your connection and try again.
            </li>
          )}
          {status === "empty" && (
            <li className="searchBox__resultsList__noteItem">
              No places match “{query.trim()}”. Try a city, street or landmark.
            </li>
          )}
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`searchBox__resultsList__item-${i}`}
              role="option"
              aria-selected={i === active}
              className={
                i === active
                  ? "searchBox__resultsList__item is-active"
                  : "searchBox__resultsList__item"
              }
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(r);
              }}
            >
              <span className="searchBox__name">{r.name}</span>
              <span className="searchBox__address">{r.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = `

`;
