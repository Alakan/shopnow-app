const express=require("express"),path=require("path");
const app=express(),PORT=process.env.PORT||3000;
app.use(express.json());app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
const products=[
{id:101,name:"Clavier mécanique RGB",description:"Clavier mécanique rétroéclairé, switches rouges",category:"Informatique",price:79.90},
{id:102,name:"Souris sans fil",description:"Souris optique sans fil, 1600 DPI",category:"Informatique",price:29.50},
{id:103,name:"Écran 24 pouces",description:"Moniteur Full HD 1920x1080, HDMI",category:"Informatique",price:139.00},
{id:104,name:"Casque circum-aural",description:"Casque audio à réduction de bruit passive",category:"Audio",price:59.90},
{id:105,name:"Webcam HD",description:"Webcam Full HD avec microphone intégré",category:"Informatique",price:49.90},
{id:106,name:"Enceinte Bluetooth",description:"Enceinte portable Bluetooth",category:"Audio",price:45.00}];
const users=[{id:1,firstName:"Alice",lastName:"Test",email:"alice@shopnow.test",password:"Password123!"}];
app.get("/api/products",(req,res)=>res.json(products));
app.get("/api/products/:id",(req,res)=>{const p=products.find(x=>x.id===Number(req.params.id));if(!p)return res.status(404).json({message:"Produit introuvable"});res.json(p)});
app.post("/api/register",(req,res)=>{const{firstName,lastName,email,password}=req.body;if(!firstName||!lastName||!email||!password)return res.status(400).json({message:"Tous les champs sont obligatoires."});if(users.some(u=>u.email.toLowerCase()===email.toLowerCase()))return res.status(409).json({message:"Un compte existe déjà avec cet email."});const u={id:users.length+1,firstName,lastName,email,password};users.push(u);res.status(201).json({message:"Compte créé avec succès.",user:{id:u.id,firstName,lastName,email}})});
app.post("/api/login",(req,res)=>{const{email,password}=req.body;const u=users.find(x=>x.email.toLowerCase()===String(email||"").toLowerCase()&&x.password===password);if(!u)return res.status(401).json({message:"Email ou mot de passe incorrect."});res.json({message:"Connexion réussie.",user:{id:u.id,firstName:u.firstName,lastName:u.lastName,email:u.email}})});
app.get("/api/health",(req,res)=>res.json({status:"UP"}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`ShopNow JS : http://localhost:${PORT}`));