import { NextRequest, NextResponse } from "next/server"
import { Result } from "../../../types"
import axios from "axios"
// import { SocksProxyAgent } from "socks-proxy-agent"

export async function GET(request: NextRequest) {
  const fullUrl = request.nextUrl.searchParams.get("url")

  // Sanity check
  if (!fullUrl) return NextResponse.json({})

  // Checking with the valid URL pattern
  const validURLPattern = /^https:\/\/rj\.app\/m\/[A-Za-z0-9]{8}$/
  if (!validURLPattern.test(fullUrl)) return NextResponse.json({})

  let rjResponse: string = ""

  const rjPath = fullUrl.split("rj.app/")[1]
  const url = `https://104.21.45.54:443\/${rjPath}`

  await axios
    .get(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        host: "rj.app",
      },
    })
    .then((res) => {
      rjResponse = res.data
    })
    .catch((err) => {
      console.log(err)
      return NextResponse.json({})
    })

  // Getting all URLs file names
  const sc = scrapeMp3Urls(rjResponse)

  // Constructing the response
  const result = await Promise.all(
    sc.map(async (url) => {
      const filename = await getFilenameFromUrl(url)
      return { name: filename, url: url } as Result
    })
  )

  return NextResponse.json(result)
}

// Get the server filename from a URL for the mp3 file
const getFilenameFromUrl = async (mp3Url: string) => {
  const parsedUrl = new URL(mp3Url)

  try {
    const res = await fetch(parsedUrl.href, {
      method: "HEAD",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      },
    })

    if (res.status !== 200) {
      return res.status.toString()
    }

    const contentDisposition = res.headers.get("content-disposition")
    if (!contentDisposition) {
      return "No Content-Disposition"
    }

    const filenameMatch = contentDisposition.match(/filename="(.+)"/)
    if (!filenameMatch) {
      return "No File Name"
    }

    return filenameMatch[1]
  } catch {
    return "UnExpected Error!"
  }
}

// Scrapes all mp3 URLs from the text response
const scrapeMp3Urls = (response: string) => {
  const mp3UrlRegex = /https:\/\/[^\s"]+\.mp3/g
  const mp3Urls = response.match(mp3UrlRegex) || []
  return mp3Urls
}

// Makes a GET request to an arbitrary URL (with redirection enabled)
// const getResponse = async (url: string) => {
//   try {
//     const parsedUrl = new URL(url)
//     // const response = await fetch(parsedUrl)
//     const response = await fetch(parsedUrl, {
//       headers: {
//         "user-agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
//       },
//     })
//     return await response.text()
//   } catch (error: any) {
//     return error.message
//   }
// }
