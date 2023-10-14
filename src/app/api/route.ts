import { NextRequest, NextResponse } from "next/server"
import { Result } from "../../../types"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  // Sanity check
  if (!url) return NextResponse.json({})

  // Checking with the valid URL pattern
  const validURLPattern = /^https:\/\/rj\.app\/m\/[A-Za-z0-9]{8}$/
  if (!validURLPattern.test(url)) return NextResponse.json({})

  // Getting all provided URLs
  const rjResponse = await getResponse(url)

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
  const options = {
    method: "HEAD",
  }

  try {
    const res = await fetch(parsedUrl.href, options)

    if (res.status !== 200) {
      return ""
    }

    const contentDisposition = res.headers.get("content-disposition")
    if (!contentDisposition) {
      return ""
    }

    const filenameMatch = contentDisposition.match(/filename="(.+)"/)
    if (!filenameMatch) {
      return ""
    }

    return filenameMatch[1]
  } catch {
    return ""
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
    const response = await fetch(parsedUrl)
    return await response.text()
  } catch {
    return ""
  }
}
