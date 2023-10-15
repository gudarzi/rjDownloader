import { NextRequest, NextResponse } from "next/server"
import { Result } from "../../../types"
import axios from "axios"
import { SocksProxyAgent } from "socks-proxy-agent"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  // Sanity check
  if (!url) return NextResponse.json({})

  console.log("[+] url-0: ", request.nextUrl.href)
  console.log("[+] url-1: ", url)

  // Checking with the valid URL pattern
  const validURLPattern = /^https:\/\/rj\.app\/m\/[A-Za-z0-9]{8}$/
  if (!validURLPattern.test(url)) return NextResponse.json({})

  // Getting all provided URLs
  let rjResponse: string = await getResponse(url)

  console.log("[+] rj-0: ", rjResponse.length)
  // console.log("[+] rj-response: ", rjResponse)
  // if (rjResponse.length < 10000) {
  if (true) {
    console.log("[-] Direct access failed! Trying the proxy...")

    const proxyIP = "184.178.172.13"
    const proxyPort = 15311
    const proxyAgent = new SocksProxyAgent(`socks5://${proxyIP}:${proxyPort}`)

    const axiosConfig = {
      httpsAgent: proxyAgent,
      httpAgent: proxyAgent,
      proxy: {
        protocol: "http", //'http',
        host: proxyIP, // your http proxy ip
        port: proxyPort, // your http proxy port
        // optional - add it if your proxy require auth
        // auth: {
        //   username: "myuser",
        //   password: "mypass",
        // },
      },
    }

    const axiosInstance = axios.create(axiosConfig)

    axiosInstance
      .get(url)
      .then((res) => {
        // console.log("Public IP address:", res.data)
        rjResponse=res.data
      })
      .catch((err) => {
        console.log(err)
        return NextResponse.json({})
      })

    console.log("[+] rj-0: ", rjResponse.length)
  }
  // return NextResponse.json({ res: rjResponse.toString() })

  // Getting all URLs file names
  const sc = scrapeMp3Urls(rjResponse)

  console.log("[+] rj-1: ", sc.length)

  // Constructing the response
  const result = await Promise.all(
    sc.map(async (url) => {
      const filename = await getFilenameFromUrl(url)
      return { name: filename, url: url } as Result
    })
  )

  console.log("[+] rj-2: ", result.length)
  console.log("[+] rj-2: ", result)

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
const getResponse = async (url: string) => {
  try {
    const parsedUrl = new URL(url)
    // const response = await fetch(parsedUrl)
    const response = await fetch(parsedUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      },
    })
    return await response.text()
  } catch (error: any) {
    return error.message
  }
}
