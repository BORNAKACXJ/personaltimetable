import React from 'react'

export function PdfDownload({ edition }) {
  if (!edition || !edition.pdf_download_link) {
    return null;
  }

  return (
    <div className="timetable__pdf-download">
      <a 
        href={edition.pdf_download_link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn__pdf-download"
      >
        <i className="fa-sharp fa-solid fa-download"></i>
        {edition.pdf_cta_text || 'Download PDF'}
      </a>
    </div>
  )
}
