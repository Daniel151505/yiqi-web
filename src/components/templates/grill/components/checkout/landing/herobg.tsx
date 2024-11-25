"use client"

import { useTranslations } from "next-intl"

export interface VideoBG {
  videoUrl: string
}

export default function VideoBackground(url: VideoBG) {
  const t =  useTranslations("Grill")
  return (
    <div className="fixed inset-0 h-screen -z-20 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src={url.videoUrl} type="video/mp4" />
        {t("notSupported")}
      </video>
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
  )
}
