# Bölümün görsellerini hazırlar ve sogan-neden-aglatir/assets.js içine data URI olarak gömer.
# (file:// sayfasında ayrı resim dosyası tuvali "kirletir", render toDataURL alamaz; gömülü veri bu sorunu yaşamaz.)
import base64, io, json, os, tempfile, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')+'/'
SP=os.path.join(tempfile.gettempdir(),'sogan-sprites')+'/'
OUTJS=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets.js')
TEST=os.path.join(tempfile.gettempdir(),'sogan-test')+'/'
os.makedirs(TEST,exist_ok=True)
assets={}

def put(name, im, q=86, extra=None):
    buf=io.BytesIO()
    if im.mode=='RGBA': im.save(buf,'WEBP',quality=q,method=6,exact=False)
    else: im.convert('RGB').save(buf,'WEBP',quality=q,method=6)
    assets[name]={'src':'data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode(),'w':im.width,'h':im.height,**(extra or {})}
    return buf.tell()

def sp(n): return Image.open(SP+n+'.png').convert('RGBA')
def erode(im, px=2):
    # krem zeminden ayrılan parçaların açık renkli kenarını içeri al
    a=np.asarray(im).astype(np.float32).copy()
    al=ndi.grey_erosion(a[...,3],size=(2*px+1,2*px+1)); a[...,3]=ndi.gaussian_filter(al,0.6)
    return Image.fromarray(a.astype(np.uint8),'RGBA')
FLOOD={'xCurious','xAmazed','xLaugh','xThink','xCry','xFire','poseFront','poseSide','poseBack'}

def fade_rows(im, y0, y1, keep='above', xr=None):
    # y0..y1 arasında alfa yumuşak geçiş; keep='above' → üst kalır. xr: yalnızca bu yatay aralıkta
    a=np.asarray(im).copy().astype(np.float32)
    h=a.shape[0]; ys=np.arange(h)[:,None]
    f=np.clip((y1-ys)/(y1-y0),0,1) if keep=='above' else np.clip((ys-y0)/(y1-y0),0,1)
    f=np.repeat(f,a.shape[1],axis=1)
    if xr: f[:,:max(0,int(xr[0]))]=1; f[:,int(xr[1]):]=1
    a[...,3]*=f
    return Image.fromarray(a.astype(np.uint8),'RGBA')

# --- konuşan baş: ağız sayfasındaki başlar, boyundan kesilmiş
NECK=(545,575)                     # baş görüntüsünde boyun kesimi (yumuşak)
heads=[fade_rows(sp('mouth%d'%i),*NECK).crop((0,0,480,NECK[1])) for i in range(10)]
for i,h in enumerate(heads): put('mouth%d'%i,h)
# göz şeridi: göz sayfasındaki aynı baştan yalnızca kaş-göz bandı
BAND=(250,385)
for i in range(10):
    e=sp('eyes%d'%i).crop((0,0,480,NECK[1]))
    a=np.asarray(e).astype(np.float32).copy()
    ys=np.arange(a.shape[0])[:,None]
    f=np.clip(np.minimum(ys-BAND[0], BAND[1]-ys)/14,0,1)
    a[...,3]*=f
    band=Image.fromarray(a.astype(np.uint8),'RGBA').crop((0,BAND[0],480,BAND[1]))
    put('eyes%d'%i,band)

# --- gövdeler: başı silinmiş; baş yerine konuşan baş çizilir
def goggle_box(im, ymax):
    a=np.asarray(im).astype(float)[:ymax]
    r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    m=(al>200)&(abs(r-g)<18)&(abs(g-b)<22)&(r>120)&(r<235)
    lab,nn=ndi.label(m); sizes=ndi.sum(m,lab,range(1,nn+1)); k=np.argmax(sizes)+1
    ys,xs=np.where(lab==k); return xs.min(),ys.min(),xs.max(),ys.max()
ref=goggle_box(heads[0],300)
def body_with_anchor(name, src, ymax):
    b=sp(src)
    if src in FLOOD: b=erode(b)
    gb=goggle_box(b,ymax)
    s=((gb[2]-gb[0])/(ref[2]-ref[0]) + (gb[3]-gb[1])/(ref[3]-ref[1]))/2
    hx=gb[0]-ref[0]*s; hy=gb[1]-ref[1]*s
    neck=hy+NECK[0]*s                       # gövdede boyun kesim çizgisi
    hb=fade_rows(b, neck-10, neck-2, keep='below', xr=(hx+40*s, hx+450*s))
    put(name,hb,extra={'hx':round(hx,1),'hy':round(hy,1),'hs':round(s,4)})
    # kontrol: baş yerine ağız 0 ve göz 2 (kapalı)
    test=hb.copy(); h0=heads[1].copy()
    eb=Image.open(io.BytesIO(base64.b64decode(assets['eyes2']['src'].split(',')[1]))).convert('RGBA')
    h0.alpha_composite(eb,(0,BAND[0]))
    h0=h0.resize((round(480*s),round(NECK[1]*s)),Image.LANCZOS)
    test.alpha_composite(h0,(round(hx),round(hy)))
    bg=Image.new('RGBA',test.size,(60,70,100,255)); bg.alpha_composite(test); bg.convert('RGB').save(TEST+name+'.jpg')
    return s
print('body s',body_with_anchor('body','body',260))
print('pose s',body_with_anchor('poseTools','poseFront',200))

# --- ifadeler, el ve diğer parçalar
for n in ['xCurious','xAmazed','xLaugh','xThink','xCry','xFire','hThumb','hPoint','hOpen','poseSide','poseBack']:
    put(n,erode(sp(n)) if n in FLOOD else sp(n))
# yan profil başı: kenardaki açık hâleyi temizle
hs=sp('headSide'); a=np.asarray(hs).astype(np.float32).copy()
al=a[...,3]/255; al=ndi.grey_erosion(al,size=(5,5)); a[...,3]=ndi.gaussian_filter(al,0.7)*255
put('headSide',Image.fromarray(a.astype(np.uint8),'RGBA'))

# --- gözlük: baştan (ağız 0) çıkarılır; ipucunda gözlerin üstüne iner
h=np.asarray(heads[0]).astype(np.float32)
r,g,b,al=h[...,0],h[...,1],h[...,2],h[...,3]
gm=(al>200)&(abs(r-g)<20)&(abs(g-b)<24)&(r>110)&(r<245)
gm[:110]=False; gm[265:]=False
lab,nn=ndi.label(gm); sizes=ndi.sum(gm,lab,range(1,nn+1)); keep=np.isin(lab,[i+1 for i,sz in enumerate(sizes) if sz>800])
# gözlüğün koyu çerçevesini de al: maskeyi genişlet, içini doldur
m=ndi.binary_fill_holes(ndi.binary_dilation(keep,iterations=7))
ga=h.copy(); ga[...,3]=np.where(m,255,0)*(al/255)
ga[...,3]=ndi.gaussian_filter(ga[...,3],0.8)
gy,gx=np.where(m); gbox=(gx.min(),gy.min(),gx.max()+1,gy.max()+1)
put('goggles',Image.fromarray(ga.astype(np.uint8),'RGBA').crop(gbox),extra={'x':int(gbox[0]),'y':int(gbox[1])})

# --- büyüteç halkası, mutfak, ön katman, mikro dünya, soğan kareleri
put('lens',sp('lens'))
k=Image.open(SRC+'ortam_full.jpeg').convert('RGB'); k=k.resize((2400,round(2400*k.height/k.width)),Image.LANCZOS); put('kitchen',k,q=84)
fg=sp('fg').crop((0,255,380,572)); put('fg',fg.resize((round(fg.width*1.9),round(fg.height*1.9)),Image.LANCZOS))
m=Image.open(SRC+'mikro_dünya_arka_plan.jpeg').convert('RGB').resize((1920,1072),Image.LANCZOS); put('micro',m,q=84)
pan=Image.open(SRC+'sogan_calisması.jpeg').convert('RGB')
for i,b in enumerate([[68,35,1342,750],[1410,35,2684,750],[68,786,1342,1502],[1410,786,2684,1502]]):
    x0,y0,x1,y1=b; c=pan.crop((x0+14,y0+14,x1-14,y1-14))   # yuvarlak köşeleri at
    put('onion%d'%(i+1),c,q=86)

js='/* Soğan Neden Ağlatır? görselleri: build_assets.py üretir (kaynaklar video/*.jpeg). Elle düzenlemeyin. */\nwindow.ASSETS = '+json.dumps(assets,separators=(',',':'))+';\n'
open(OUTJS,'w').write(js)
print('assets.js', round(len(js)/1e6,2),'MB', len(assets),'görsel')
for n,v in assets.items():
    if 'hx' in v or n=='goggles': print(n,{k:v[k] for k in v if k!='src'})
