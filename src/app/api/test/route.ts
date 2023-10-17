import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { SocksProxyAgent } from "socks-proxy-agent"

export async function GET(request: NextRequest) {
  const url = "https://chye8zv2vtc0000xwg2gge98royyyyyyb.oast.fun"

  const proxyIP = "184.178.172.18"
  const proxyPort = 15280
  const proxyAgent = new SocksProxyAgent(`socks5://${proxyIP}:${proxyPort}`)

  const axiosConfig = {
    httpsAgent: proxyAgent,
    // httpAgent: proxyAgent2,
    // proxy: {
    // protocol: "https",
    // host: `socks://${proxyIP}`,
    // port: proxyPort,
    // auth: {
    //   username: "myuser",
    //   password: "mypass",
    // },
    // },
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    }
  }

  // ignoring ssl errors
  axiosConfig.httpsAgent.options.rejectUnauthorized = false

  let results: any = []

  await axios
    .get(url, axiosConfig)
    // .get(url)
    .then((res) => {
      // console.log(res.request)
      results = NextResponse.json({
        results: res.data,
        requestData: {
          headers: res.request._header,
          // options: res.request._redirectable._options,
        },
        responseHeaders: res.headers,
      })
    })
    .catch((err) => {
      console.log(err)
      results = NextResponse.json({})
    })

  return results
}
