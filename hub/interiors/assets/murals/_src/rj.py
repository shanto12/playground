import json,sys
D='/home/user/playground/hub/interiors/assets/murals'
names=sys.argv[2:]; size=sys.argv[1].split('x')
print(json.dumps([{'svg':f'{D}/{n}.svg','png':f'{D}/_qa/{n}.png','w':int(size[0]),'h':int(size[1])} for n in names]))
