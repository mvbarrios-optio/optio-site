# Builds test/*.html: live pages with the inline Optio scripts removed and dist/ modules loaded instead.
import re,urllib.request,sys
B='https://optio-v2---client-first.webflow.io'
PAGES={'home':('/',['core','belt','reviews','map','home']),'about':('/about',['core','faq']),'work':('/work',['core','reviews','work']),
'free':('/free',['core','free']),'call':('/call',['core','call']),'scorecard':('/scorecard',['core','scorecard']),'deck':('/decks/medtech',['core','deck']),'privacy':('/privacy',['core'])}
MARK=['data-belt-track','data-h-hero','[data-w-view] img','[data-d-gal]','data-f-','data-c-tab','Roast my deck upload','OPTIO PITCH DECK SCORECARD']
for name,(path,mods) in PAGES.items():
    h=urllib.request.urlopen(B+path).read().decode()
    removed=0
    def strip(m):
        global removed
        s=m.group(0)
        if 'src=' not in s[:40] and any(k in s for k in MARK): removed+=1; return ''
        return s
    h=re.sub(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>',strip,h,flags=re.S)
    core=open('dist/inline/core.footer.html').read()  # core is inline in Webflow, so inline here too
    h=h.replace('</body>',core+''.join('<script src="../dist/%s.min.js"></script>'%m for m in mods if m!='core')+'</body>')
    open('test/%s.html'%name,'w').write(h); print(name,'removed',removed,'added',mods)
