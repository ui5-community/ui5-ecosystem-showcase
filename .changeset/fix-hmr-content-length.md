---
"ui5-middleware-hmr": patch
---

fix: guard Content-Length header assignment behind headersSent check to avoid errors when headers have already been flushed
