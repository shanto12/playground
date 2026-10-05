import json, os
from faces import *
ART = '/home/user/playground/hub/packaging/assets/boxes/art'
os.makedirs(ART, exist_ok=True)
man = {"helper": "boxes", "units": "mm", "note": "Indicative dimensions — confirm with supplier template. Faces are transparent outside their trim shape; art 'top' = physical top for walls, = back edge for lids/tops. Wrap faces (shape:wrap) map u around the object with the FRONT at u=0.5 and the seam at the back. Seal stickers are shown applied.",
       "containers": []}
def put(f, cont, dr, face, shape, mapping):
    fn = f'{cont}-{dr}-{face}.svg'
    open(f'{ART}/{fn}', 'w').write(f.svg(title=f'Curry District {cont} {face} ({dr}) — concept art'))
    return {"face": face, "file": f"assets/boxes/art/{fn}", "w_mm": round(f.w, 2), "h_mm": round(f.h, 2), "shape": shape, "mapping": mapping}
for dr in ('bazaar', 'royal'):
    sub = BZ['kraft'] if dr == 'bazaar' else RY['board']
    faces = [put(pail_face(dr,'front'),'pail',dr,'front','trapezoid','front panel; top edge 102 → bottom 70'),
             put(pail_face(dr,'back'),'pail',dr,'back','trapezoid','back panel'),
             put(pail_face(dr,'side'),'pail',dr,'side','trapezoid','both side panels; handle punch 12 mm below top centre'),
             put(pail_flap(dr,'front'),'pail',dr,'lid','trapezoid','front closing flap; art top = ridge'),
             put(pail_flap(dr,'back'),'pail',dr,'lid-back','trapezoid','back closing flap; art top = ridge'),
             put(pail_gable(dr),'pail',dr,'gable','triangle','side gable flaps; apex = ridge end')]
    man['containers'].append({"id": f"pail-{dr}", "container": "pail", "direction": dr, "title": "Takeout pail 26 oz",
        "geometry": {"base": [70, 70], "top": [P['top_w'], P['top_d']], "height": P['h'], "ridge_above_top": P['ridge'], "wire_handle": True}, "faces": faces})
    faces = [put(clam_band(dr,'top'),'clamshell',dr,'lid','rect','belly band over lid (90 wide, centred); art bottom = front edge'),
             put(clam_band(dr,'front'),'clamshell',dr,'front','rect','belly band front (taut lid edge → base edge)'),
             put(clam_band(dr,'back'),'clamshell',dr,'back','rect','belly band back'),
             put(clam_band(dr,'bottom'),'clamshell',dr,'bottom','rect','belly band under base'),
             put(clam_box_face(dr,'side'),'clamshell',dr,'side','rect','box end walls (unprinted board + stamp)'),
             put(clam_box_face(dr,'inside_lid'),'clamshell',dr,'inside-lid','rect','inner face of lid (see food-contact note)')]
    man['containers'].append({"id": f"clamshell-{dr}", "container": "clamshell", "direction": dr, "title": "Kraft clamshell 9×6 + belly band",
        "geometry": {"lid": [C['lidL'], C['lidD']], "base": [C['Lb'], C['Db']], "height": C['H'], "lid_seam_y": C['seam'], "band_width": C['band'], "board_colour": sub}, "faces": faces})
    faces = [put(tub_sleeve(dr),'tub',dr,'side','wrap','conical sleeve y 8→66 on tub; front at u=0.5'),
             put(tub_lid(dr),'tub',dr,'lid','disc','lid label Ø101.6; art bottom = front')]
    man['containers'].append({"id": f"tub-{dr}", "container": "tub", "direction": dr, "title": "Deli tub 16 oz + lid sleeve",
        "geometry": {"top_d": 2 * T['rt'], "base_d": 2 * T['rb'], "height": T['h'], "lid_d": 2 * T['lid_r'], "sleeve_y": [T['s0'], T['s1']], "tub": "frosted PP (stock)"}, "faces": faces})
    faces = [put(handi_body(dr),'handi',dr,'side','wrap','body wall, arc-length v from base (0) to neck (1)'),
             put(handi_dome(dr),'handi',dr,'lid','disc','domed lid, top-down planar projection; art bottom = front'),
             put(handi_band(dr),'handi',dr,'band','wrap','rim band (lid skirt) y 92→109')]
    man['containers'].append({"id": f"handi-{dr}", "container": "handi", "direction": dr, "title": "Handi biryani box",
        "geometry": {"profile_r_y": H['prof'], "band_r": H['band_r'], "band_y": [H['band_y0'], H['band_y0'] + H['band_h']], "dome_rise": H['dome_h'], "knob_r": H['knob_r']}, "faces": faces})
    faces = [put(tray_face(dr,'lid'),'tray',dr,'lid','rect','sleeve top; art top = back'),
             put(tray_face(dr,'front'),'tray',dr,'front','rect','sleeve front long side'),
             put(tray_face(dr,'back'),'tray',dr,'back','rect','sleeve back long side'),
             put(tray_face(dr,'side'),'tray',dr,'side','rect','drawer end face (pull end)'),
             put(tray_face(dr,'traywall'),'tray',dr,'tray-wall','rect','drawer long walls (outside)')]
    man['containers'].append({"id": f"tray-{dr}", "container": "tray", "direction": dr, "title": "2-compartment drawer tray",
        "geometry": {"sleeve": [TR['L'], TR['D'], TR['H']], "tray": [TR['tL'], TR['tD'], TR['tH']], "divider_from_pull_end": round(TR['tL'] * .36, 1), "open_ends": "short ends"}, "faces": faces})
json.dump(man, open(f'{ART}/manifest.json', 'w'), indent=1)
print(len(os.listdir(ART)), 'files', sum(os.path.getsize(f'{ART}/{f}') for f in os.listdir(ART)) // 1024, 'KB')
