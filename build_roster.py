import json,re,pathlib
p=pathlib.Path('/mnt/data/SpikeLegends_V3/public')
text=(p/'haikyuu-data.js').read_text(); original=json.loads(text.split('const HAIKYUU_ROSTER = ',1)[1].split(';\n',1)[0])
# Wiki character directory: additional named roster members, reserves and special clubs.
extra='''
KARASUNO|Chikara Ennoshita|OH
KARASUNO|Hisashi Kinoshita|OH
KARASUNO|Kazuhito Narita|MB
NEKOMA|Taketora Yamamoto|OH
NEKOMA|Tamahiko Teshiro|S
NEKOMA|Yuki Shibayama|L
AOBA JOHSAI|Shigeru Yahaba|S
AOBA JOHSAI|Shinji Watari|L
AOBA JOHSAI|Yutaro Kindaichi|MB
AOBA JOHSAI|Akira Kunimi|OP
DATE TECH|Yutaka Obara|OH
DATE TECH|Takehito Sasaya|OH
DATE TECH|Yasushi Kamasaki|MB
DATE TECH|Taro Onagawa|OH
DATE TECH|Jingo Fukiage|MB
DATE TECH|Kosuke Sakunami|L
FUKURODANI|Tatsuki Washio|MB
FUKURODANI|Shuichi Anahori|S
FUKURODANI|Haruki Komi|L
FUKURODANI|Wataru Onaga|MB
SHIRATORIZAWA|Taichi Kawanishi|MB
SHIRATORIZAWA|Kai Akakura|L
SHIRATORIZAWA|Yusho Sagae|OH
JOHZENJI|Kazuma Bobata|MB
JOHZENJI|Takeharu Futamata|S
JOHZENJI|Katsumichi Higashiyama|OH
JOHZENJI|Rintaro Numajiri|L
JOHZENJI|Nobuyoshi Izaka|OP
JOHZENJI|Arata Tsuchiyu|OH
WAKUNAN|Shunki Kawatabi|OH
WAKUNAN|Kazumasa Hanayama|S
WAKUNAN|Yuki Shiroishi|MB
WAKUNAN|Teppei Naruko|MB
WAKUNAN|Kazuteru Akiu|L
WAKUNAN|Tsuyoshi Matsushima|OH
KAKUGAWA|Yoshiaki Nurukawa|S
KAKUGAWA|Eiji Makado|OH
KAKUGAWA|Kaito Asamushi|OH
KAKUGAWA|Yuzuru Komaki|L
KAKUGAWA|Isao Inagaki|MB
KAKUGAWA|Taishi Minamida|MB
INARIZAKI|Ren Omimi|MB
INARIZAKI|Yuto Kosaku|OH
INARIZAKI|Heisuke Riseki|OH
NOHEBI|Suguru Daisho|OH
NOHEBI|Yoshiya Takachiho|MB
NOHEBI|Kazuma Numai|OP
NOHEBI|Koji Hiroo|MB
NOHEBI|Isumi Sakishima|S
NOHEBI|So Akama|L
NOHEBI|Akihiko Seguro|OH
ITACHIYAMA|Tsukasa Iizuna|S
TSUBAKIHARA|Kazuki Maruyama|OH
TSUBAKIHARA|Sakae Echigo|S
TSUBAKIHARA|Chiharu Tsukioka|MB
TSUBAKIHARA|Motoki Teradomari|OH
TSUBAKIHARA|Dai Mikawa|OP
TSUBAKIHARA|Togo Iwamuro|OH
TSUBAKIHARA|Yoshitomo Atema|MB
TSUBAKIHARA|Yushi Maiko|OH
TSUBAKIHARA|Akifumi Kaikake|L
TSUBAKIHARA|Aoi Himekawa|OH
SARUKAWA TECH|Itaru Shiramine|OH
SARUKAWA TECH|Hisahiko Wakura|S
SARUKAWA TECH|Iori Kanazawa|OH
SARUKAWA TECH|Tomonari Shiga|MB
SARUKAWA TECH|Tomokazu Wajima|L
SARUKAWA TECH|Kenro Fukatani|OH
SARUKAWA TECH|Soji Yamashiro|OP
MUJINAZAKA|Wakatsu Kiryu|OH
MUJINAZAKA|Nozomu Mami|MB
MUJINAZAKA|Keisuke Unnan|MB
MUJINAZAKA|Naoharu Ezota|OH
MUJINAZAKA|Michiru Usuri|S
MUJINAZAKA|Subaru Hondo|OH
MUJINAZAKA|Haruma Bishin|L
KAMOMEDAI|Keiichiro Kanbayashi|S
KAMOMEDAI|Liam Tokura|OH
KAMOMEDAI|Izuru Nozawa|OH
KAMOMEDAI|Aikichi Suwa|S
KAMOMEDAI|Yukihiro Kanbayashi|L
TOKONAMI|Hikaru Komaki|OH
TOKONAMI|Kazuma Chaya|OH
TOKONAMI|Hayato Ikejiri|OH
TOKONAMI|Hiroki Tamagawa|MB
TOKONAMI|Yoshiharu Haga|S
TOKONAMI|Rikuto Shibuya|MB
TOKONAMI|Taiga Sakurai|L
OHGIMINAMI|Yoshiki Towada|OH
OHGIMINAMI|Takumi Karamatsu|OH
OHGIMINAMI|Yuki Tazawa|S
OHGIMINAMI|Ayumu Moritake|MB
OHGIMINAMI|Soma Oyasu|MB
OHGIMINAMI|Ibuki Natsuse|L
OHGIMINAMI|Shun Yokote|OP
UBUGAWA|Masaki Gora|OH
UBUGAWA|Yohei Ashiya|S
UBUGAWA|Kengo Nanasawa|MB
UBUGAWA|Shingo Sengoku|OH
UBUGAWA|Yuji Isehara|OH
UBUGAWA|Koji Yukawa|L
UBUGAWA|Toshimi Nakagawa|MB
SHINZEN|Daiki Ogano|OH
SHINZEN|Shota Naguri|S
SHINZEN|Noriaki Shimafu|OH
SHINZEN|Eikichi Chigaya|MB
SHINZEN|Masaru Kodama|OP
SHINZEN|Yu Akatani|L
SHINZEN|Kazutaka Yoshikawa|MB
'''
known={(x['school'],x['name'].lower()) for x in original}
for raw in extra.strip().splitlines():
 school,name,pos=raw.split('|');
 if (school,name.lower()) in known:continue
 # New reserves use lightweight portraits unless an online image loads
 original.append(dict(name=name,pos=pos,school=school,ability='Team Specialist',secret=False))
 known.add((school,name.lower()))
clubs={'MSBY BLACK JACKALS':[('Shoyo Hinata','OP'),('Kotaro Bokuto','OH'),('Atsumu Miya','S'),('Kiyoomi Sakusa','OH'),('Adriah Tomas','MB'),('Oliver Barnes','MB')], 'SCHWEIDEN ADLERS':[('Tobio Kageyama','S'),('Wakatoshi Ushijima','OP'),('Korai Hoshiumi','OH'),('Nicollas Romero','OH')],'JAPAN NATIONAL':[('Shoyo Hinata','OP'),('Tobio Kageyama','S'),('Wakatoshi Ushijima','OP'),('Kotaro Bokuto','OH'),('Kiyoomi Sakusa','OH'),('Atsumu Miya','S'),('Korai Hoshiumi','OH')]}
# Only named central characters are allowed at pro/national level; keep schools separate.
for school,members in clubs.items():
 for name,pos in members:
  original.append(dict(name=name,pos=pos,school=school,ability='Professional Instinct',secret=True,proOnly=True))
# Add missing role players while preserving old indices, drop name duplicates in new extras only.
seen=set();dedup=[]
for c in original:
 k=(c['school'],c['name'])
 if k not in seen:dedup.append(c);seen.add(k)
original=dedup
coaches='''Keishin Ukai|KARASUNO|attack|6
Ittetsu Takeda|KARASUNO|chemistry|5
Ikkei Ukai|KARASUNO|strategy|5
Yasufumi Nekomata|NEKOMA|defense|7
Manabu Naoi|NEKOMA|defense|5
Tanji Washijo|SHIRATORIZAWA|attack|8
Akira Saito|SHIRATORIZAWA|focus|5
Nobuteru Irihata|AOBA JOHSAI|setting|6
Sadayuki Mizoguchi|AOBA JOHSAI|focus|4
Takeyuki Yamiji|FUKURODANI|attack|6
Norimune Kurosu|INARIZAKI|attack|7
Takuro Oiwake|DATE TECH|defense|7
Takaaki Anabara|JOHZENJI|speed|6
Kiyoshi Omizu|NOHEBI|strategy|5
Tatsumi Osado|TSUBAKIHARA|focus|5
Michiko Kuzuri|MUJINAZAKA|attack|6
Kiyoko Shimizu|KARASUNO|focus|5
Hitoka Yachi|KARASUNO|coins|7
Yukie Shirofuku|FUKURODANI|energy|5
Kaori Suzumeda|FUKURODANI|focus|5
Hana Misaki|JOHZENJI|chemistry|5
Mai Nametsu|DATE TECH|focus|5
Aaron Murphy|KAMOMEDAI|defense|8
Samson Foster|MSBY BLACK JACKALS|attack|8
Banjo Suzaku|SCHWEIDEN ADLERS|strategy|8
Kiyoshi Omizu|NOHEBI|strategy|5
Norimune Kurosu|INARIZAKI|setting|7'''
coachesData=[]
for i,line in enumerate(coaches.splitlines()):
 name,school,buff,n=line.split('|');coachesData.append({'id':'coach-'+str(i),'name':name,'school':school,'buff':buff,'value':int(n),'rating':min(96,69+int(n)*3+(i%4))})
# Additional confirmed canon teams, benches, and V.League reserves.
more='KAMOMEDAI|Isao Norikura|OP\nKAMOMEDAI|Kazuyoshi Bessho|MB\nMSBY BLACK JACKALS|Shugo Meian|MB\nMSBY BLACK JACKALS|Shion Inunaki|L\nMSBY BLACK JACKALS|Alexandre Joffe|MB\nSCHWEIDEN ADLERS|Toshiro Heiwajima|L\nSCHWEIDEN ADLERS|Fukuro Hirugami|MB\nSCHWEIDEN ADLERS|Tatsuto Sokolov|MB\nSCHWEIDEN ADLERS|Keigo Nishiura|OH\nSCHWEIDEN ADLERS|Terutsugu Inubousaki|OP\nTACHIBANA RED FALCONS|Aran Ojiro|OH\nTACHIBANA RED FALCONS|Gao Hakuba|MB\nEJP RAIJIN|Rintaro Suna|MB\nEJP RAIJIN|Tatsuki Washio|MB\nEJP RAIJIN|Motoya Komori|L\nEJP RAIJIN|Nagito Sarukui|OH\nAZUMA GREEN ROCKETS|Wakatsu Kiryu|OH\nNIYAMA GIRLS|Kanoka Amanai|OH\nNIYAMA GIRLS|Maiko Yonezawa|S\nNIYAMA GIRLS|Natsu Hinata|OH\nYUKIGAOKA|Shoyo Hinata|OH\nYUKIGAOKA|Yukitaka Izumi|S\nYUKIGAOKA|Koji Sekimukai|MB\nYUKIGAOKA|Tatsuya Mori|OH\nYUKIGAOKA|Saiya Suzuki|MB\nYUKIGAOKA|Yuki Kawashima|L\nKITAGAWA DAIICHI|Toru Oikawa|S\nKITAGAWA DAIICHI|Hajime Iwaizumi|OH\nKITAGAWA DAIICHI|Tobio Kageyama|S\nKITAGAWA DAIICHI|Yutaro Kindaichi|MB\nKITAGAWA DAIICHI|Akira Kunimi|OP\nKITAGAWA DAIICHI|Kaito Hashikami|OH'
for line in more.splitlines():
 school,name,pos=line.split('|')
 if not any(c['name']==name and c['school']==school for c in original):
  original.append(dict(name=name,pos=pos,school=school,ability='Team Specialist',secret=False,proOnly=school in ['MSBY BLACK JACKALS','SCHWEIDEN ADLERS','TACHIBANA RED FALCONS','EJP RAIJIN','AZUMA GREEN ROCKETS']))
for c in original:
 if c['school']=='KAMOMEDAI' and c['name']=='Keiichiro Kanbayashi':c['pos']='L'
 if c['school']=='KAMOMEDAI' and c['name']=='Liam Tokura':c['pos']='S'
 if c['school']=='KAMOMEDAI' and c['name']=='Yukihiro Kanbayashi':c['name']='Keiichiro Kanbayashi';c['pos']='L'
for i,x in enumerate(original):x['portraitIndex']=i if i<52 else None;x['id']=i
schoolColors={'KARASUNO':'#e99036','NEKOMA':'#d45b55','FUKURODANI':'#ccb27e','INARIZAKI':'#bda15d','SHIRATORIZAWA':'#9d79b7','AOBA JOHSAI':'#7ebbc0','DATE TECH':'#50aebc','KAMOMEDAI':'#9ab3ca','ITACHIYAMA':'#72b6ba','JOHZENJI':'#e5ad52','MSBY BLACK JACKALS':'#d8a644','SCHWEIDEN ADLERS':'#7e99b6','JAPAN NATIONAL':'#d55252'}
js='// Player roster compiled using Haikyuu Wiki character directory; fan project.\nconst SPIKE_ROSTER = '+json.dumps(original,ensure_ascii=False,separators=(',',':'))+';\nconst SPIKE_COACHES = '+json.dumps(coachesData,ensure_ascii=False,separators=(',',':'))+';\nconst SPIKE_COLORS = '+json.dumps(schoolColors,separators=(',',':'))+';\nif(typeof module !== "undefined") module.exports = {SPIKE_ROSTER,SPIKE_COACHES,SPIKE_COLORS};\n'
(p/'roster-data.js').write_text(js)
print('roster',len(original),'schools',len(set(x['school'] for x in original)),'coaches',len(coachesData))
