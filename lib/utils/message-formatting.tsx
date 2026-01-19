import React from 'react'

// Utility function to convert URLs in text to clickable links
export function formatMessageWithLinks(text: string): React.ReactNode {
  if (!text) return text
  
  // Regex to match URLs: http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
  
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let matchCount = 0
  
  // Use matchAll for better iteration
  const matches = Array.from(text.matchAll(urlRegex))
  
  for (const match of matches) {
    // Add text before the URL
    if (match.index! > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index!)
      if (textBefore) {
        parts.push(textBefore)
      }
    }
    
    // Add the URL as a link
    let url = match[0]
    let href = url
    
    // If it starts with www., prepend https://
    if (url.toLowerCase().startsWith('www.')) {
      href = `https://${url}`
    }
    
    parts.push(
      <a
        key={`url-${matchCount++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#81D8D0] hover:underline break-all"
      >
        {url}
      </a>
    )
    
    lastIndex = match.index! + match[0].length
  }
  
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex)
    if (textAfter) {
      parts.push(textAfter)
    }
  }
  
  // If no URLs found, return the text as-is
  if (parts.length === 0) {
    return text
  }
  
  return <>{parts}</>
}
