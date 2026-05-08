import json, urllib.request, urllib.error
base='http://localhost:8080'

def req(method,path,body=None,token=None):
    url=base+path
    headers={}
    data=None
    if token:
        headers['Authorization']='Bearer '+token
    if body is not None:
        headers['Content-Type']='application/json'
        data=json.dumps(body).encode('utf-8')
    r=urllib.request.Request(url,data=data,headers=headers,method=method)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw=resp.read().decode('utf-8')
            try: obj=json.loads(raw) if raw else None
            except: obj=raw
            return {'status':resp.status,'ok':True,'body':obj}
    except urllib.error.HTTPError as e:
        raw=e.read().decode('utf-8')
        try: obj=json.loads(raw) if raw else None
        except: obj=raw
        return {'status':e.code,'ok':False,'body':obj}

# logins after role update
seller=req('POST','/api/auth/login',{'email':'seller1@shopflow.test','password':'Seller123!'})
admin=req('POST','/api/auth/login',{'email':'admin1@shopflow.test','password':'Admin123!'})
cust=req('POST','/api/auth/login',{'email':'customer1@shopflow.test','password':'Customer123!'})

seller_t=seller.get('body',{}).get('token') if isinstance(seller.get('body'),dict) else None
admin_t=admin.get('body',{}).get('token') if isinstance(admin.get('body'),dict) else None
cust_t=cust.get('body',{}).get('token') if isinstance(cust.get('body'),dict) else None

results=[]
def add(step,res,exp):
    results.append({'step':step,'expected':exp,'actual':res.get('status'),'passed':res.get('status')==exp,'body':res.get('body')})

add('POST /api/auth/login seller',seller,200)
add('POST /api/auth/login admin',admin,200)
add('POST /api/auth/login customer',cust,200)

r=req('GET','/api/auth/me',token=cust_t); add('GET /api/auth/me',r,200)
r=req('GET','/api/auth/me'); add('GET /api/auth/me (no token)',r,401)
r=req('POST','/api/categories',{'nom':'Electronics','description':'Devices and gadgets','parentId':None},admin_t); add('POST /api/categories',r,201)
r=req('POST','/api/products',{'name':'Wireless Mouse','price':49.90,'quantity':25},seller_t); add('POST /api/products',r,201)
product_id = r.get('body',{}).get('id') if isinstance(r.get('body'),dict) else None
r=req('POST','/api/addresses',{'rue':'123 Main Street','ville':'Tunis','codePostal':'1000','pays':'TN','principal':True},cust_t); add('POST /api/addresses',r,201)
address_id = r.get('body',{}).get('id') if isinstance(r.get('body'),dict) else None
r=req('GET','/api/addresses',token=cust_t); add('GET /api/addresses',r,200)
r=req('POST','/api/cart/items',{'productId':product_id,'variantId':None,'quantite':2},cust_t); add('POST /api/cart/items',r,200)
r=req('GET','/api/cart',token=cust_t); add('GET /api/cart',r,200)
r=req('POST','/api/orders',{'addressId':address_id},cust_t); add('POST /api/orders',r,201)
order_id = r.get('body',{}).get('id') if isinstance(r.get('body'),dict) else None
r=req('GET','/api/orders/my?page=0&size=10&sort=dateCommande,desc',token=cust_t); add('GET /api/orders/my',r,200)

# negative
r=req('POST','/api/products',{'name':'Forbidden Product','price':9.99,'quantity':1},cust_t); add('POST /api/products as customer',r,403)
r=req('GET','/api/cart'); add('GET /api/cart (no token)',r,401)
r=req('POST','/api/addresses',{'ville':'Tunis','codePostal':'1000','pays':'TN','principal':False},cust_t); add('POST /api/addresses invalid',r,400)
r=req('POST','/api/cart/items',{'productId':product_id,'variantId':None,'quantite':9999},cust_t); add('POST /api/cart/items stock overflow',r,409)

out={'ids':{
    'customerUserId': cust.get('body',{}).get('userId') if isinstance(cust.get('body'),dict) else None,
    'sellerUserId': seller.get('body',{}).get('userId') if isinstance(seller.get('body'),dict) else None,
    'adminUserId': admin.get('body',{}).get('userId') if isinstance(admin.get('body'),dict) else None,
    'productId': product_id,
    'addressId': address_id,
    'orderId': order_id
},'results':results}
print(json.dumps(out))
