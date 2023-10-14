"use client"

import { useState } from "react"
import { Result } from "../types"

export default function RJDownloader() {
  const [results, setResults] = useState<Result[]>([])
  const [address, setAddress] = useState("")

  function sendRequest() {
    fetch(`/api?url=${address}`).then(async (result) => {
      const res = await result.json()
      setResults(res)
    })
  }

  return (
    <div>
      <input
        placeholder='RJ Music Address'
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ color: "black", width: 300, textAlign: "center" }}
      />
      <button
        onClick={sendRequest}
        style={{
          width: 65,
          height: 24,
          verticalAlign: "center",
          backgroundColor: "white",
          color: "black",
        }}
      >
        Check
      </button>
      {results?.length > 0 ? (
        <ul>
          {results.map((result: Result, index: number) => (
            <li key={index}>
              <a target='_blank' href={result.url}>
                {result.name}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading ...</p>
      )}
    </div>
  )
}
