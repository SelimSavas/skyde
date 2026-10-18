# Kaynak görsellerden saydam parçalar üretir (sprites/*.png) ve kontrol için bir temas sayfası.
import json, os, tempfile, numpy as np
from PIL import Image
from scipy import ndimage as ndi
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')+'/'
OUT=os.path.join(tempfile.gettempdir(),'sogan-sprites')+'/'
os.makedirs(OUT,exist_ok=True)

def load(n): return np.asarray(Image.open(SRC+n).convert('RGB')).astype(np.float32)

def key_magenta(a):
    r,g,b=a[...,0],a[...,1],a[...,2]
    # macenta payı: R ile B'nin ortak fazlası G'nin üstünde
    m=np.minimum(r,b)-g
    alpha=np.clip(1-(m-60)/120,0,1)       # m>=180 tam zemin, m<=60 tam ön plan
    # renk taşmasını temizle: yarı saydam kenarda macentayı çıkar
    key=np.array([255,0,255],np.float32)
    a2=np.where(alpha[...,None]>0.02,(a-(1-alpha[...,None])*key)/np.maximum(alpha[...,None],0.02),0)
    a2=np.clip(a2,0,255)
    # kenarda kalan pembe: G'yi R/B'nin altına düşmüş pikselleri dengele
    pink=(np.minimum(a2[...,0],a2[...,2])-a2[...,1])>40
    a2[pink,0]=a2[pink,1]+ (a2[pink,0]-a2[pink,1])*0.35
    a2[pink,2]=a2[pink,1]+ (a2[pink,2]-a2[pink,1])*0.35
    return a2,alpha

def key_flood(a, tol, seeds='trl'):
    # köşe rengine yakın ve kenara bağlı bölge zemin
    bg=np.median(np.array([a[2,2],a[2,-3]]),axis=0)
    d=np.sqrt(((a-bg)**2).sum(-1))
    near=d<tol
    lab,n=ndi.label(near)
    border=set()
    if 't' in seeds: border|=set(np.unique(lab[0]))
    if 'b' in seeds: border|=set(np.unique(lab[-1]))
    if 'l' in seeds: border|=set(np.unique(lab[:,0]))
    if 'r' in seeds: border|=set(np.unique(lab[:,-1]))
    border-= {0}
    bgm=np.isin(lab,list(border))
    # kenar yumuşatma
    soft=ndi.gaussian_filter((~bgm).astype(np.float32),0.8)
    alpha=np.clip(soft*1.6-0.3,0,1)
    alpha[~bgm]=1
    return a,alpha

def save(name, rgb, alpha, box, pad=6, scale=1.0):
    x0,y0,x1,y1=box
    x0=max(0,x0-pad); y0=max(0,y0-pad); x1=min(rgb.shape[1],x1+pad); y1=min(rgb.shape[0],y1+pad)
    rgba=np.dstack([rgb[y0:y1,x0:x1],alpha[y0:y1,x0:x1]*255]).astype(np.uint8)
    im=Image.fromarray(rgba,'RGBA')
    if scale!=1.0: im=im.resize((round(im.width*scale),round(im.height*scale)),Image.LANCZOS)
    im.save(OUT+name+'.png')
    return [x0,y0,x1,y1]

meta={}
# ağız ve göz sayfaları: 10'ar baş
mouth=[[118,44,586,751],[634,44,1103,751],[1149,44,1618,751],[1665,44,2134,751],[2184,45,2652,751],[120,798,583,1495],[638,798,1102,1495],[1153,799,1616,1495],[1668,799,2133,1495],[2187,798,2651,1495]]
eyes=[[118,44,585,751],[634,44,1103,751],[1149,44,1618,751],[1665,44,2134,751],[2184,44,2652,751],[118,798,583,1495],[637,798,1102,1495],[1151,799,1616,1495],[1666,799,2133,1495],[2184,798,2651,1495]]
a=load('agız_sekillerii.jpeg'); rgb,al=key_magenta(a)
for i,b in enumerate(mouth): meta['mouth%d'%i]=save('mouth%d'%i,rgb,al,b)
a=load('goz_sekilleri.jpeg'); rgb,al=key_magenta(a)
for i,b in enumerate(eyes): meta['eyes%d'%i]=save('eyes%d'%i,rgb,al,b)
# parçalar
a=load('karakter_parcalari.jpeg'); rgb,al=key_magenta(a)
parts={'body':[96,69,615,1494],'head':[649,82,974,579],'headSide':[1689,93,1892,320],
 'hOpen':[737,1226,977,1388],'hRelax':[1039,1268,1257,1439],'hFist':[1328,1266,1512,1412],'hPoint':[1578,1276,1833,1417],'hThumb':[1895,1234,2070,1432],
 'hSpoon':[2143,1083,2348,1478],'hLens':[2402,1071,2663,1460]}
for k,b in parts.items(): meta[k]=save(k,rgb,al,b)
# ifadeler (krem zemin; etiket yazısı altta kalır, kesimin altı tohum değil)
a=load('karakter_kuklası.jpeg')
expr={'xCurious':[100,1000,520,1442],'xAmazed':[560,995,905,1442],'xLaugh':[985,1000,1335,1442],'xThink':[1420,1000,1760,1446],'xCry':[1810,1000,2225,1436],'xFire':[2270,995,2690,1437],
 'poseFront':[140,80,680,990],'poseSide':[1670,80,1910,985],'poseBack':[2100,80,2630,975]}
for k,b in expr.items():
    x0,y0,x1,y1=b; crop=a[y0:y1,x0:x1]
    rgb2,al2=key_flood(crop,14,'trl')
    full_rgb=np.zeros_like(a); full_al=np.zeros(a.shape[:2],np.float32)
    full_rgb[y0:y1,x0:x1]=rgb2; full_al[y0:y1,x0:x1]=al2
    meta[k]=save(k,full_rgb,full_al,b,pad=0)
# büyüteç halkası
a=load('büyüteç_geçiş.jpeg'); rgb,al=key_magenta(a)
meta['lens']=save('lens',rgb,al,[724,118,2372,1534])
# ön katman (düşük çözünürlük; bulanık ön plan olduğu için yeterli)
a=load('ön_katman.jpeg'); rgb,al=key_magenta(a)
meta['fg']=save('fg',rgb,al,[0,0,a.shape[1],a.shape[0]],pad=0)
json.dump(meta,open(OUT+'meta.json','w'),indent=0)

# temas sayfası: koyu zemin üzerinde
names=list(meta.keys())
thumbs=[]
for n in names:
    im=Image.open(OUT+n+'.png'); im.thumbnail((260,260)); thumbs.append((n,im))
cols=8; rows=(len(thumbs)+cols-1)//cols
sheet=Image.new('RGB',(cols*270,rows*290),(40,44,60))
from PIL import ImageDraw
d=ImageDraw.Draw(sheet)
for i,(n,im) in enumerate(thumbs):
    x=(i%cols)*270+5; y=(i//cols)*290+5
    sheet.paste(im,(x,y),im); d.text((x,y+265),n,fill=(255,255,0))
sheet.save(OUT+'_sheet.jpg',quality=80)
print(len(names))
