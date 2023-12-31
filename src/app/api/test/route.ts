import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { SocksProxyAgent } from "socks-proxy-agent"

export const revalidate = 0

export async function POST(request: NextRequest) {
  // const url = "https://httpbin.org/ip"
  // const url = "https://104.21.45.54:443/m/Qq6BkB0q"

  const reqBody = await request.json()
  const fullUrl = reqBody.url

  // Sanity check
  if (!fullUrl) return NextResponse.json({})

  // Checking with the valid URL pattern
  const validURLPattern = /^https:\/\/rj\.app\/m\/[A-Za-z0-9]{8}$/
  if (!validURLPattern.test(fullUrl)) return NextResponse.json({})

  const rjPath = fullUrl.split("rj.app/")[1]
  const url = `https://104.21.45.54:443\/${rjPath}`

  const proxyIP = "184.178.172.18"
  const proxyPort = 15280
  const proxyAgent = new SocksProxyAgent(`socks5://${proxyIP}:${proxyPort}`)

  const axiosConfig = {
    httpsAgent: proxyAgent,
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      "host": "rj.app",
    },
  }

  // ignoring ssl errors
  axiosConfig.httpsAgent.options.rejectUnauthorized = false

  let results: any = []

  await axios
    .get(url, axiosConfig)
    .then((res) => {
      results.push({
        results: res.data,
        requestData: {
          headers: res.request._header,
        },
        responseHeaders: res.headers,
      })
    })
    .catch((err) => {
      console.log(err)
      results.push({})
    })

  await axios
    .get(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "host": "rj.app",
      },
    })
    .then((res) => {
      results.push({
        results: res.data,
        requestData: {
          headers: res.request._header,
        },
        responseHeaders: res.headers,
      })
    })
    .catch((err) => {
      console.log(err)
      results.push({})
    })

  return NextResponse.json(results)
}
