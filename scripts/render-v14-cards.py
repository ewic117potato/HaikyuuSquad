"""Rebuild current collectible artwork without requiring an image service.
Artwork uses fan-created local illustrations. One opt-in generated Hinata hero portrait
is included from the existing design concept; other cards attempt verified online portraits
in the live game, and the local SVG remains fallback.
"""
import json,io,math,random,os
import numpy as np
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
import cairosvg
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'public/cards/catalog.json').read_text())
W,H=480,720
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
if not Path(FONT).exists():
 FONT='/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'; FONT_REG=FONT
TITLE=lambda n:ImageFont.truetype(FONT,n)
BODY=lambda n:ImageFont.truetype(FONT_REG,n)
COLORS={0:(80,157,246),1:(83,199,239),2:(168,121,246),3:(249,187,66),4:(223,99,244),5:(181,131,211)}
SVG_CACHE={}
HERO_FILE=ROOT/'assets/hinata_concept.webp'
POSTER_FILE=ROOT/'assets/roster_reference.webp'
POSTER=Image.open(POSTER_FILE).convert('RGB') if POSTER_FILE.exists() else None
POSTER_FACES={
 'Tobio Kageyama':(129,33),'Kei Tsukishima':(233,33),'Yu Nishinoya':(338,33),
 'Asahi Azumane':(550,33),'Ryunosuke Tanaka':(444,33),
 'Toru Oikawa':(22,226),'Wakatoshi Ushijima':(559,226),'Kotaro Bokuto':(1083,226),
 'Atsumu Miya':(462,422),'Osamu Miya':(560,422),'Rintaro Suna':(662,422)
}
HERO=None
if HERO_FILE.exists():
 img=Image.open(HERO_FILE).convert('RGB')
 HERO=img.crop((285,175,708,461))
 def hero_picture():
  return ImageEnhance.Contrast(HERO.resize((410,475),Image.Resampling.LANCZOS)).enhance(1.10)

def portrait_png(entry):
 portrait=str(entry.get('portrait') or '')
 path=ROOT/'public'/portrait
 if portrait in SVG_CACHE:return SVG_CACHE[portrait]
 if not path.exists():return None
 try:
  png=cairosvg.svg2png(url=str(path),output_width=370,output_height=470)
  im=Image.open(io.BytesIO(png)).convert('RGBA')
 except Exception:return None
 SVG_CACHE[portrait]=im
 return im

def blend(top,bottom,t):return tuple(int(a*(1-t)+b*t) for a,b in zip(top,bottom))

def fit_text(draw,text,max_width,size,minsize=17):
 while size>minsize and draw.textbbox((0,0),text,font=TITLE(size))[2]>max_width:size-=1
 return TITLE(size)

def draw_new(entry,staff=False):
 k=entry.get('key',''); stage=entry.get('stage',0);grade=entry.get('tier',0) if staff else stage
 color=COLORS.get(grade,(200,160,255))
 rnd=random.Random(k)
 yy,xx=np.mgrid[0:H,0:W]
 radial=np.clip(1-np.sqrt(((xx-W*.6)/(W*.95))**2+((yy-H*.28)/(H*.72))**2),0,1)
 t=np.minimum(.40,.50*radial*(1-yy/H*.25))
 base=np.stack([7+13*radial,12+10*radial,28+17*radial],axis=2)
 canvas=base*(1-t[:,:,None])+np.asarray(color)[None,None,:]*t[:,:,None]
 bg=Image.fromarray(np.uint8(np.clip(canvas,0,255)),'RGB')
 draw=ImageDraw.Draw(bg,'RGBA')
 for i in range(16):
  x=rnd.randint(-130,W+150);y=rnd.randint(-50,int(H*.72));r=rnd.randint(22,120)
  draw.ellipse((x-r,y-r,x+r,y+r),outline=(*color,rnd.randint(20,75)),width=rnd.randint(2,6))
 for i in range(18):
  x=rnd.randint(0,W);y=rnd.randint(0,int(H*.72))
  draw.line((x,y,x+rnd.randrange(-200,200),y+rnd.randrange(80,300)),fill=(*color,rnd.randint(30,90)),width=rnd.randint(2,9))
 # Arena grid
 for y in [88,112,136,160,185,208,239,269,290,320]:
  draw.line((0,y,W,y),fill=(241,245,255,10),width=1)
 for x in range(-280,850,110):
  draw.line((W//2,380,x,H),fill=(*color,30),width=3)
 # Hero crop: use source generated design illustration for Hinata; all others use distinctive local illustrations.
 if entry.get('name')=='Shoyo Hinata' and HERO is not None:
  art=hero_picture().convert('RGBA')
  art.putalpha(215)
  bg.paste(art,(35,145),art)
 elif POSTER is not None and entry.get('name') in POSTER_FACES:
  x,y=POSTER_FACES[entry['name']]
  # Use the user-supplied AI roster artwork as a recognisable card thumbnail;
  # this is a small crop, not a standalone official animation frame.
  art=POSTER.crop((x+22,y+25,x+94,y+97)).resize((410,475),Image.Resampling.LANCZOS).convert('RGBA')
  art.putalpha(235)
  bg.paste(art,(35,145),art)
 else:
  art=portrait_png(entry)
  if art:
   shadow=Image.new('RGBA',(W,H))
   shadow.paste(art,(58,126),art)
   shadow=shadow.filter(ImageFilter.GaussianBlur(27))
   colour=Image.new('RGBA',(W,H),(*color,150));shadow=Image.alpha_composite(Image.new('RGBA',(W,H)),shadow)
   bg=Image.alpha_composite(bg.convert('RGBA'),shadow)
   bg.paste(art,(58,126),art)
 draw=ImageDraw.Draw(bg,'RGBA')
 # Bottom scrim for readability
 for y in range(448,H):
  alpha=int(130+(y-448)/(H-448)*125)
  draw.line((0,y,W,y),fill=(3,7,22,alpha))
 draw.polygon(((0,0),(110,0),(0,110)),fill=(*color,245))
 draw.rounded_rectangle((12,12,W-12,H-12),radius=23,outline=(*color,255),width=8)
 draw.rounded_rectangle((22,22,W-22,H-22),radius=18,outline=(253,239,214,130),width=2)
 draw.rounded_rectangle((38,34,165,137),radius=14,fill=(5,13,31,238),outline=(*color,180),width=2)
 power=str(entry.get('power') or '')
 if staff:power=str(entry.get('bonus') or 1)+'%'
 ft=fit_text(draw,power,116,66)
 draw.text((48,42),power,font=ft,fill=(255,238,190,255),stroke_width=1,stroke_fill=(0,0,0,160))
 draw.text((49,112),'BONUS' if staff else 'OVR',font=TITLE(18),fill=(245,250,255,255))
 stage_name='COACH' if staff and entry.get('type')=='Coach' else 'MANAGER' if staff else ['SCHOOL','NATIONALS','TIMESKIP','PRO','QUEST LEGEND'][min(4,stage)]
 draw.rounded_rectangle((274,34,438,90),radius=12,fill=(8,11,35,230),outline=(*color,200),width=2)
 ft=fit_text(draw,stage_name,150,22,13)
 draw.text((356,62),stage_name,anchor='mm',font=ft,fill=(255,255,255,255))
 # Rarity flag and name
 rar='SECRET' if staff and entry.get('tier',0)==5 else 'MYTHIC' if stage>=4 else 'PROFESSIONAL' if stage==3 else 'ELITE' if entry.get('power',0) and entry.get('power',0)>=97 else 'COLLECTIBLE'
 draw.text((42,482),rar+'  /  '+('STAFF' if staff else 'ATHLETE'),font=TITLE(17),fill=(*color,255))
 name=entry['name'].upper()
 words=name.split()
 surname=words[-1] if words else name
 nameprefix=' '.join(words[:-1])
 draw.text((42,513),nameprefix[:24],font=fit_text(draw,nameprefix,395,26),fill=(245,247,255,255))
 draw.text((41,547),surname[:22],font=fit_text(draw,surname[:22],395,49,24),fill=(255,254,254,255),stroke_width=1,stroke_fill=(2,6,15,180))
 draw.line((42,615,439,615),fill=(*color,220),width=3)
 school=entry.get('school','')
 draw.text((43,631),school[:27],font=fit_text(draw,school[:27],380,20,12),fill=(243,248,255,255))
 ability=(entry.get('buff','') if staff else entry.get('ability','')) or ''
 role=(entry.get('type','') if staff else entry.get('position','')) or ''
 draw.text((43,665),(str(ability).upper()[:32]+'   • '+str(role).upper())[:39],font=fit_text(draw,str(ability).upper()[:32]+' • '+str(role).upper(),393,15,11),fill=(*color,255))
 return bg.convert('RGB')

def patch_existing(file,entry):
 im=Image.open(file).convert('RGBA')
 d=ImageDraw.Draw(im,'RGBA')
 # Leave the original collector composition/artwork unchanged, but replace outdated rating.
 d.rounded_rectangle((25,27,170,147),radius=15,fill=(4,13,33,255),outline=(255,234,189,220),width=2)
 txt=(str(entry.get('bonus',''))+'%') if entry.get('stage')==5 else str(entry.get('power') or '?')
 ff=fit_text(d,txt,122,72,39)
 d.text((36,41),txt,font=ff,fill=(255,240,199,255))
 d.text((35,113),'BUFF' if entry.get('stage')==5 else 'OVR',font=TITLE(17),fill=(207,227,250,255))
 return im.convert('RGB')

for idx,c in enumerate(DATA['cards']+DATA['staff']):
 file=ROOT/'public'/c['file'];file.parent.mkdir(parents=True,exist_ok=True)
 # Existing cards have a textured frame; preserve those images to avoid replacing art with flat portraits.
 try: im=patch_existing(file,c) if file.exists() else draw_new(c,c.get('stage')==5)
 except Exception: im=draw_new(c,c.get('stage')==5)
 im.save(file,'WEBP',quality=90,method=3)
 if idx%100==0: print(f'finished {idx} / {len(DATA["cards"])+len(DATA["staff"])}')
print('Rendered',len(DATA['cards'])+len(DATA['staff']),'cards')
