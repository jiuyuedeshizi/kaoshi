"use client";

import { useEffect, useRef, useState } from "react";

export function TicketPdfPreview({ src, title }: { src: string; title: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    const container = containerRef.current;

    async function renderPdf() {
      try {
        setError("");
        setLoading(true);

        const response = await fetch(src, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("准考证预览加载失败，请直接下载 PDF 查看。");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const loadingTask = pdfjs.getDocument(objectUrl);
        const pdf = await loadingTask.promise;

        if (!active || !container) {
          return;
        }

        container.innerHTML = "";

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.45 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("当前浏览器无法渲染准考证预览，请直接下载 PDF 查看。");
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "ticket-pdf-canvas";
          canvas.setAttribute("aria-label", `${title} 第 ${pageNumber} 页`);

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise;

          if (!active || !container) {
            return;
          }

          container.appendChild(canvas);
        }

        if (active) {
          setLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "准考证预览加载失败，请直接下载 PDF 查看。");
          setLoading(false);
        }
      }
    }

    void renderPdf();

    return () => {
      active = false;
      if (container) {
        container.innerHTML = "";
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, title]);

  if (error) {
    return <p className="empty-copy no-print">{error}</p>;
  }

  return (
    <>
      {loading ? <p className="empty-copy no-print">准考证 PDF 预览加载中...</p> : null}
      <div
        ref={containerRef}
        className={`ticket-pdf-stage${loading ? " is-loading" : ""}`}
        aria-label={title}
      />
    </>
  );
}
