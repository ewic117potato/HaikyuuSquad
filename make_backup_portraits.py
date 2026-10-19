import pathlib,json,random,html
p=pathlib.Path('/mnt/data/SpikeLegends_V3/public')
js=(p/'roster-data.js').read_text()
rows=json.loads(js.split('const SPIKE_ROSTER = ',1)[1].split(';\n',1)[0]);palette={'KARASUNO':'#e9a34b','NEKOMA':'#a8464a','FUKURODANI':'#c0a87b','INARIZAKI':'#c09b65','SHIRATORIZAWA':'#ad8bc2','AOBA JOHSAI':'#7fadb6','DATE TECH':'#5a9ba8','KAMOMEDAI':'#a4c4d9','MSBY BLACK JACKALS':'#d4aa4a','SCHWEIDEN ADLERS':'#9eb3d5'}
for i,c in enumerate(rows):
 filename=p/'portraits'/f'{i:02d}.svg'
 if filename.exists():continue
 r=random.Random(i*992+42);color=palette.get(c['school'],'#6c9ca9');hair=r.choice(['#252329','#7a5136','#4b4c45','#c79f61','#171d24','#99918c']);skin=r.choice(['#e8b995','#e1b490','#c99470','#f0cba7']); eyes=r.choice(['#4a403c','#5f4c3e','#2c4453']);short=html.escape(c['name'].split(' ')[-1].upper());school=html.escape(c['school']);n=(i*7)%16+1
 hairpath=r.choice(['M66 102 Q58 39 124 43 Q192 39 190 110 L171 77 L159 68 L123 69 L92 82 Z','M63 113 Q46 51 112 38 Q181 25 193 106 L172 72 L145 65 L122 59 L94 88 Z','M68 106 Q66 35 132 42 Q189 43 182 111 Q161 84 138 75 Q99 72 83 97Z'])
 xml=f'''<svg xmlns="http://www.w3.org/2000/svg" width="260" height="310" viewBox="0 0 260 310" role="img" aria-label="Stylized fan portrait of {html.escape(c['name'])}">
 <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="{color}" stop-opacity=".76"/><stop offset="1" stop-color="#101927"/></linearGradient></defs>
 <rect width="260" height="310" rx="12" fill="url(#bg)"/><circle cx="131" cy="103" r="82" fill="#fff" opacity=".065"/><path d="M16 312 Q8 223 85 194 L122 218 L160 193 Q255 209 251 310" fill="#111925" stroke="{color}" stroke-width="6"/><path d="M107 180 L108 223 Q128 246 150 224 L150 174" fill="{skin}"/><ellipse cx="129" cy="119" rx="65" ry="78" fill="{skin}"/><path d="{hairpath}" fill="{hair}"/><path d="M97 124 Q110 119 121 125 M143 125 Q154 118 166 124" stroke="{eyes}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M113 164 Q131 169 148 162" stroke="#9c6759" stroke-width="2" fill="none"/><path d="M119 221 L129 251 L140 220" fill="none" stroke="{color}" stroke-width="4"/><text x="129" y="291" text-anchor="middle" fill="{color}" font-size="29" font-family="Arial" font-weight="900">{n}</text><rect x="12" y="9" width="236" height="24" rx="5" fill="#000" opacity=".44"/><text x="130" y="25" font-size="12" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">{school}</text><rect x="0" y="303" width="260" height="7" fill="{color}"/></svg>'''
 filename.write_text(xml)
print('Total vector fallback portraits',len(list((p/'portraits').glob('*.svg'))))
