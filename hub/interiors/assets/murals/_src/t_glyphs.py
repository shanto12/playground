from common import *
from neon import *
W,H=1600,1100
b=[rect(0,0,W,H,fill='#fff')]
y=150
for words,table,sz,sl in [("Chai Time",SCRIPT,120,10),("Slow-simmered",SCRIPT,110,10),("Order here",SCRIPT,110,10),("Curry",SCRIPT,120,10),("DISTRICT · ORDER HERE",CAPS,80,0),("NAAN STOP & #CURRY",CAPS,80,0)]:
    pcs,w=set_mono(words,table,sz,80,y,tracking=12 if table is SCRIPT else 30,slant=sl)
    b.append(path(''.join(p.d() for p in pcs),fill='none',stroke='#1D1147',stroke_width=sz*0.08,stroke_linecap='round',stroke_linejoin='round'))
    y+= sz*1.65
p,w=text_path("CURRY DISTRICT",F('bowlby'),90,80,y+20)
b.append(path(p.d(),fill='none',stroke='#E4147E',stroke_width=5))
b.append(path(text_on_path("BIRYANI BOULEVARD",F('bowlby'),40,"M900 1000C1100 850 1300 1050 1550 900").d(),fill='#1D1147'))
b.append(path("M900 1000C1100 850 1300 1050 1550 900",fill='none',stroke='#ccc'))
save('_qa/t_glyphs.svg',doc(W,H,''.join(b)))
