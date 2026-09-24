#!/usr/bin/env python3
"""
本地预览服务器（可选）。

这套教程**不需要服务器** —— 双击 index.html 就能用，
因为所有资源都是相对路径的普通 <script> / <link>，没有 ES 模块、没有 fetch。

这个脚本只是提供一个 http:// 地址，方便：统一管理标签页、在别的设备上访问、或者
某些浏览器对 file:// 的限制。它强制指定了 .js/.css/.svg 的 MIME 并禁用缓存，
改完刷新就能看到。

用法：
    python3 serve.py            # 默认 8000 端口
    python3 serve.py 8080       # 指定端口
    python3 serve.py --offline  # 不自动打开浏览器
"""
import functools
import http.server
import os
import socketserver
import sys
import threading
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))

# 需要强制指定的 MIME（不依赖系统 mimetypes，避免平台差异）
FORCE_TYPE = {
    ".mjs": "text/javascript; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".wasm": "application/wasm",
    ".whl": "application/octet-stream",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".svg": "image/svg+xml",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        path = self.path.split("?")[0]

        # 全是开发中的文件，禁用缓存，改完刷新就能看到
        self.send_header("Cache-Control", "no-cache, must-revalidate")

        ext = os.path.splitext(path)[1].lower()
        if ext in FORCE_TYPE:
            # 覆盖父类可能已发出的 Content-Type
            self.send_header("X-Content-Type", FORCE_TYPE[ext])

        super().end_headers()

    def guess_type(self, path):
        ext = os.path.splitext(str(path))[1].lower()
        if ext in FORCE_TYPE:
            return FORCE_TYPE[ext]
        return super().guess_type(path)

    def log_message(self, fmt, *args):
        # 只打印错误，正常请求不刷屏
        if args and str(args[1]).startswith(("4", "5")):
            sys.stderr.write("  %s\n" % (fmt % args))


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    port = int(args[0]) if args else 8000
    open_browser = "--offline" not in sys.argv

    with Server(("127.0.0.1", port), Handler) as httpd:
        url = "http://localhost:%d/" % port
        print("")
        print("  C/C++ 程序设计教程")
        print("  " + "─" * 44)
        print("  地址:  %s" % url)
        print("  目录:  %s" % ROOT)
        print("  停止:  Ctrl+C")
        print("")

        if open_browser:
            threading.Timer(0.6, lambda: webbrowser.open(url)).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  已停止。\n")


if __name__ == "__main__":
    main()
