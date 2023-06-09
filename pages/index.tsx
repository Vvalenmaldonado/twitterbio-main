import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState,useEffect } from "react";
import { Canvas } from '@react-three/fiber'
import { Toaster, toast } from "react-hot-toast"; //Libreria para mostrar mensajes emergentes.
import DropDown, { VibeType } from "../components/DropDown";
import { HomeScene } from '../scenes/homeScene'
import * as THREE from 'three'; //THREE
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import LoadingDots from "../components/LoadingDots";  //ANIMACION
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useLayoutEffect } from "react";
import ScrollHandler from '../components/ScrollHandler';






const Home: NextPage = () => {
  const [loading, setLoading] = useState(false); //INDICADOR DE CARGA.
  const [bio, setBio] = useState("");  //Inicia con cadena vacia, es la informacion que da el usuario.
  const [vibe, setVibe] = useState<VibeType>("Non-restricted"); //La forma o tipo de biografia.
  const [generatedBios, setGeneratedBios] = useState(""); //Almacena las biografias generadas por la AI.
  //three
const canvasRef = useRef<null | HTMLCanvasElement>(null);

const containerRef = useRef<null | any   >(null);

  const bioRef = useRef<null | HTMLDivElement>(null); // UseRef() Crea una referencia de un elemento en el DOM que puede cambiar, con esa referencia accedo a las propiedades y metodos del DOM.
                                                      // En este caso apunta a un elemento DIV. empieza en null.

  const scrollToBios = () => {  //Funcion para scrollear al elemento referido, en este caso un div (La respuesta de la AI que esta declarada arriba)
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });// Si el elemento DOM aparece, se scrollea de forma suave y animada hasta el.
    }
  };

  const prompt = `Desarrolla un asistente virtual de cocina que proporcione instrucciones detalladas y consejos prácticos para la preparación de recetas personalizadas. 
  Tu objetivo es proporcionar una receta paso por paso basada en estos ingredientes: ${bio} Asegurate que la respuesta no exceda los 1000 caracteres y si la receta necesita coccion, aclara el tiempo y los grados a los que se deberia cocinar.
  ${
    vibe === "Vegetarian"
      ? "Asegurate que la receta sea vegetariana. Si usa ingredientes no apto en una receta vegetariana, asegurate de quitarlos de la receta y avisa que fueron eliminados"
      : null
  } ${
    vibe === "Vegan"
      ? "Asegurate que la receta sea Vegana.Si usa ingredientes de origen animal, asegurate de quitarlos de la receta y avisa que fueron eliminados."
      : null
  }${
    vibe === "Gluten-free"
      ? "Asegurate que la receta sea libre de gluten. Si usa ingredientes con gluten, asegurate de quitarlos de la receta y avisa que fueron eliminados."
      : null
  }
  ${
    vibe === "Pregnancy-safe"
      ? "Asegurate que la receta apta para embarazadas, Si agrega ingredientes no aptos para embarazadas, asegurate de quitarlos de la receta y avisa que fueron eliminados."
      : null
  }
  ${
    bio.slice(-1) === "." ? "" : "." // slice(-1) obtiene el ultimo caracter, Si la variable "bio" no termina en un punto ".", se agrega un punto al final de la cadena.
  }`;

  const generateBio = async (e: any) => {
    e.preventDefault();// Se ejecutara cuando se clickeo el formulario.
    setGeneratedBios(""); //Se borra cualquier biografia generada previamente. 
    setLoading(true);  //La web espera la respuesta del servidor.
    const response = await fetch("/api/generate", { //Realiza la peticion, desde la key
      method: "POST",// la peticion es un post
      headers: {
        "Content-Type": "application/json",  //La peticion es en formato JSON
      },
      body: JSON.stringify({
        prompt, // almacena la respuesta, y la pasamos de string a JSON
      }),
    });

    if (!response.ok) { //Maneja la respuesta del servidor despues de la solicitud. Si la respuesta  tiene error (!response.ok) devuelve el error.
      throw new Error(response.statusText); // es una excepción que se lanza cuando la respuesta HTTP devuelta por la solicitud no está en el rango de 200 a 299, lo que indica que la solicitud no se ha realizado correctamente.
    }                 // devuelve el texto del estado de la respuesta HTTP.

    // This data is a ReadableStream:  Es una interfaz de JavaScript que permite a los desarrolladores trabajar con datos que se pueden leer de forma asíncrona, lo que significa que los datos no se cargan en memoria de una sola vez, sino que se van leyendo por pedazos.
    const data = response.body;
    if (!data) {
      return; //se crea un objeto ReadableStream que contiene los datos de la respuesta. Luego, se verifica si data existe y, si no es así, se devuelve inmediatamente sin hacer nada.
    }
    //Convierte la respuesta en texto.
    const reader = data.getReader(); // La función getReader() devuelve un objeto ReadableStreamDefaultReader que permite leer datos de un stream en formato binario.
    const decoder = new TextDecoder();//  Esta clase proporciona un método decode() Si no se proporciona ningún parámetro, se utilizará la codificación por defecto, que es UTF-8.
    let done = false;

    //while se ejecutará hasta que se haya leído todo el stream de datos. La condición del bucle se verifica en cada iteración para ver si done es false. Si es así, el bucle sigue ejecutándose
    while (!done) { 
      const { value, done: doneReading } = await reader.read();
      done = doneReading; //el bucle se detendrá cuando se haya llegado al final del stream.
      const chunkValue = decoder.decode(value); //El chunk (trozo) de datos leído del stream en formato binario se convierte a formato de texto utilizando la instancia de la clase TextDecoder creada anteriormente. El resultado se almacena en chunkValue.
      setGeneratedBios((prev) => prev + chunkValue); // Se almacena el valor.
    }
    scrollToBios(); //Cuando while este hecho se activa la funcion del scroll hasta el elemento DIV (respuesta AI. )
    setLoading(false); //Deja de cargar el buton.
  };


//Scroll direction section

//Scroll GSAP
gsap.registerPlugin(ScrollTrigger);

useLayoutEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  
  const h2Elements = Array.from(container.querySelectorAll('h2'));
  const h1Element = Array.from(container.querySelectorAll('h1'));
  const h3Elements = Array.from(container.querySelectorAll('h3'));
  const chatGptGenerator = Array.from(container.querySelectorAll('.animateOpacity'));
  console.log(chatGptGenerator, 'chatGptGenerator')

  
  
  const animate = [...h1Element, ...h2Elements, ...h3Elements].flatMap((element: any) => {
    if (element.nodeName === 'H3') {
      // Divide cada elemento en caracteres separados
      const characters = element.textContent.split('');
      // Reemplaza el contenido original con elementos <span> para cada caracter
      element.innerHTML = characters.map((char: any) => `<span class="word">${char}</span>`).join('');
    } else {
      // Divide cada elemento en palabras separadas
      const words = element.textContent.split(/\s+/);
      // Reemplaza el contenido original con elementos <span> para cada palabra
      element.innerHTML = words.map((word: any) => `<span class="word">${word}</span>`).join(' ');
    }
    // Retorna los elementos <span> para cada caracter o palabra
    return Array.from(element.querySelectorAll('.word'));
  });
  
animate.push(...chatGptGenerator)
  const timelines: any = [];
  animate.forEach((element: any) => {
    const timeline = gsap.timeline({
      defaults: {
        opacity: 0,
        duration: 1.2,
        ease: 'power4.inOut',
      },
    });
    // Aplica un retardo aleatorio a la animación de opacidad de cada palabra
    timeline.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, delay: Math.random() * 0.5 }
    );
    timelines.push(timeline);
  });

  animate.forEach((element: any, index: number) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 15%',
        animation: timelines[index],
        toggleActions: 'play reverse play reverse',
      });
  });

  return () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };

}, []);

const canvasFoodRef = useRef<null | HTMLCanvasElement>(null);
  useEffect(() => {

    
    //FOOD
    const canvasFood = canvasFoodRef.current; //FOOD
 
    if (!canvasFood) {
      return;
    }
    const scene2 = new THREE.Scene();
    const camera2 = new THREE.PerspectiveCamera(25, canvasFood.offsetWidth / canvasFood.offsetHeight, 0.1, 1000);   
    camera2.position.z =5;
    const renderer2 = new THREE.WebGLRenderer({canvas: canvasFood, antialias:true, alpha:true});
    renderer2.setSize(canvasFood.offsetWidth, canvasFood.offsetHeight);
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer2.render(scene2, camera2)
    
     //Luces.
     const ambientLightF = new THREE.AmbientLight(0xffffff,0.8)
     scene2.add(ambientLightF);
     const directionalLightF = new THREE.DirectionalLight(0xffffff,1)
     directionalLightF.position.set(1,2,0)
     scene2.add(directionalLightF)
  
    let chef: THREE.Object3D | null = null;
    let cake: THREE.Object3D | undefined;
    let apple: THREE.Object3D | undefined;
    let avocado: THREE.Object3D | undefined;
    let chicken: THREE.Object3D | undefined;
    let cheese: THREE.Object3D | null = null;
    let egg: THREE.Object3D | null = null;
    let food: THREE.Object3D | null = null;
    let carrot: THREE.Object3D | undefined;
    const loader = new GLTFLoader();
    loader.load('/low_poly_food.glb',(glb)=>{
      cake = glb.scene.getObjectByName('Cake_lambert1_0'); 
      carrot = glb.scene.getObjectByName('Carrot_lambert1_0') 
      chicken = glb.scene.getObjectByName('ChickenLeg_lambert1_0');
      apple = glb.scene.getObjectByName('Apple_lambert1_0');
      avocado = glb.scene.getObjectByName('Avocado_lambert1_0');
      food = glb.scene;
      const radius = 5.2;
      food.rotation.x = Math.PI * 2
      food.rotation.y = Math.PI * 1.4
      food.rotation.z = Math.PI * 2
      food.position.y = Math.PI * 0.2
      food.position.x =Math.PI * -0.2
      food.scale.set(radius, radius,radius)
      

         // Animamos el objeto
    const clock2 = new THREE.Clock()
    let lastElapsedTime2 = 0
    //Animacion Adentro del renderizado.
    function tick2() {
      const elapsedTime2 = clock2.getElapsedTime();
      lastElapsedTime2 = elapsedTime2
      if(cake){
        // cake.position.set(0, -5, 3);
        cake.rotation.set(0.4, -5.2, -0.6); 
        cake.position.y = Math.sin(elapsedTime2 * 1.2) * 0.4 - 6
       
      }
      if(avocado){
        avocado.position.set(0, -8, -20); // Set the position of the cake mesh
        avocado.rotation.set(0,-5,0)
        avocado.position.y = Math.sin(elapsedTime2 * 2) * 0.3 - 4
       }
       if(apple){
        apple.position.set(30, -20, -40); 
        apple.position.y = Math.sin(elapsedTime2 * 1.5) * 0.35 - 20
       }
        if(chicken){
        chicken.position.set(-40, -10, -55); // Set the position of the cake mesh
        chicken.rotation.set(0.3,4.5,0) // Set the position of the cake mesh
        chicken.position.y = Math.sin(elapsedTime2 * 1.6) * 0.6 - 8
        }
        if(carrot){
        carrot.position.set(-25,-34,0)  
        carrot.rotation.set(0,4.8,0)
        carrot.position.y = Math.sin(elapsedTime2 * 2.5) * 0.3 - 35
        }
        if(egg){
          egg.position.y = Math.sin(elapsedTime2 * 1) * 0.05 - 1
        }
        if(cheese ){   
          cheese.position.y = Math.sin(elapsedTime2 * 1.3) * 0.05 - 0.5
        }
      renderer2.render(scene2, camera2);
      window.requestAnimationFrame(tick2);
    }
    tick2()
    scene2.add(food)
    renderer2.render(scene2, camera2);
    })

    const canvas = canvasRef.current; //FRIDGE
    if (!canvas) {
      return;
    }


//FRIDGE
    // Creamos una instancia de la escena y la cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, canvas.width / canvas.height, 0.1, 1000);
    // Movemos la cámara hacia atrás para que podamos ver el objeto //FRIDGE
    camera.position.z = 5;
    //Luces.
    const ambientLight = new THREE.AmbientLight(0xffffff,0.8)
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff,1)
    directionalLight.position.set(1,2,0)
    scene.add(directionalLight)
    //Sizes //FRIDGE
    const sizes = {
    width: window.innerWidth, //es el ancho disponible para la visualización de contenido en la ventana del navegador, excluyendo la barra de herramientas, las barras de desplazamiento y los bordes de la ventana. (PIXELES)
    height: window.innerHeight

    }
     // Creamos un renderizador y lo agregamos al DOM 
     const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); //habilitaría el anti-aliasing, que es una técnica utilizada para suavizar los bordes dentados en gráficos 3D. Esto puede mejorar la calidad visual de la imagen renderizada. (No todos los dispositivos aceptan esto)
     //Agregar alpha: true a las opciones del constructor haría que el canvas del WebGLRenderer fuera transparente, permitiendo que otros elementos en la página se muestren a través del canvas. Esto puede ser útil si deseas superponer la escena 3D sobre otros elementos HTML.
     renderer.setSize(sizes.width, sizes.height); //Declaramos el tamano del renderizador.
     renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
     renderer.render(scene, camera);

    //GLTF LOADER CHEF
   
   
    loader.load('/cute_refrigerator.glb',(glb)=>{ 
       chef = glb.scene;
      const radius = 0.4;
      chef.position.x =1.3
      // chef.position.y = 10
      chef.rotation.x = Math.PI * 2
      chef.rotation.y = Math.PI * 1.7
      chef.rotation.z = Math.PI * 2
      chef.scale.set(radius, radius,radius)
       // Animamos el objeto
    const clock = new THREE.Clock()
    let lastElapsedTime = 0
    //Animacion Adentro del renderizado.
    function tick() {
      const elapsedTime= clock.getElapsedTime();
      const deltaTime = elapsedTime - lastElapsedTime
      lastElapsedTime = elapsedTime
      if(!!chef){
        chef.position.y =Math.sin(elapsedTime * 1.2) * 0.04 - 0.6
      }
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick)
    }
    tick();
    //Scroll
    let scrollY = window.scrollY
    let currentSection = 0
    let scrollDirection: any= null
  window.addEventListener('scroll', () => { //FRIDGE
  const prevScrollY = scrollY
  scrollY = window.scrollY
  
  if (scrollY > prevScrollY) {
    scrollDirection = 'down'
  } else if (scrollY < prevScrollY) {
    scrollDirection = 'up'
  }
  const newSection = Math.round(scrollY / sizes.height)

  if (newSection !== currentSection) {
    currentSection = newSection
    console.log(currentSection,'currentSection') 
    if (scrollDirection === 'down' ) {
      console.log(currentSection * sizes.height + sizes.height * 0.5 - window.innerHeight * 0.5,'down')
        window.scrollTo({
          top: currentSection * sizes.height + sizes.height * 0.5 - window.innerHeight * 0.5,
          behavior: 'smooth'
        });
    }
    if (scrollDirection === 'up') {
      console.log(currentSection * sizes.height + sizes.height * 0.5 - window.innerHeight * 0.5,'UP')
        window.scrollTo({
          top: currentSection * sizes.height + sizes.height * 0.5 - window.innerHeight * 0.5,
          behavior: 'smooth',
        });
    }
    if (!!chef && currentSection === 0) {
      gsap.to(chef.position, {
        duration: 1.5,
        ease: 'power2.inOut',
        z: '0',
        x: '1.3'
      })
      gsap.to(chef.rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        y: '-7.22',
      })
    }
    if (!!chef && currentSection === 1 && cheese && egg) {
      gsap.to(chef.position, {
        duration: 1.5,
        ease: 'power2.inOut',
        z: '0',
        x: '-1.5'
      })
      gsap.to(chef.rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        y: '0.3',
      })
      if (chef.scale) {
        gsap.to(chef.scale, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: 0.4,
          y: 0.4,
          z: 0.4,
        })
      }
      if(cheese){
        gsap.to(cheese.position, {
          x: -20,
          duration: 1.5,
          ease: "power1.out",
          delay: 0,
        })
      }
      if(egg){
        gsap.to(egg.position, {
          x: 20,
          duration: 1.5,
          ease: "power1.out",
          delay: 0.4,
        })
      }
    }
    if (chef && currentSection === 2 && cheese && egg) {
      gsap.to(chef.rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        y: '-0.5'
      })
      gsap.to(chef.position, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '0',
        y:'20',
       
      })
      gsap.to(chef.scale, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: 0.5,
        y: 0.5,
        z: 0.5,
      })
      gsap.to(cheese.position, {
        x:-2.05,
        duration: 1,
        ease: "power1.out",
        delay: 0.5,
        toggleActions: "play reverse play reverse"
      })
      gsap.to(egg.position, {
        x: 2,
        duration: 1,
        ease: "power1.out",
        delay: 0.9,

      })
    }
    // if(currentSection === 3 && cake){ //cake animation fail
    //   console.log(cake, 'cakeot')
    //   gsap.fromTo(cake.position, {x: 50,y: 0,z:0},{x: 0,y:-5,z:3, duration: 1, ease: "power1.out", delay: 0.4,})
     
    //   // gsap.fromTo(cake.scale, {x: 0.4,y: 0,z:0},{x: 0.4,y:-5.2,z:-0.6, duration: 1, ease: "power1.out", delay: 0.4,})!
    // }
    console.log(currentSection, cake,'currentSection22222')
        }   
   })
      scene.add(glb.scene)
    }) //FINISH LOADER
    
    loader.load('/cheese_low_poly.glb',(glb)=>{
      cheese = glb.scene;
      const radius = 0.004;
      cheese.position.x = -20   //-2.05
      cheese.position.y = -0.7
      cheese.rotation.x = Math.PI * 2
      cheese.rotation.y = Math.PI * 1.5
      cheese.rotation.z = Math.PI * 2
      cheese.scale.set(radius, radius,radius)
      scene.add(glb.scene)
      renderer.render(scene, camera);
    })
    
    loader.load('/egg.glb',(glb)=>{
      egg = glb.scene;
      const radius = 0.05;
      egg.position.x = 20 //2
      egg.position.y = -1
      egg.rotation.x = Math.PI * 2
      egg.rotation.y = Math.PI * 1.5
      egg.rotation.z = Math.PI * 2
      egg.scale.set(radius, radius,radius)
      scene.add(glb.scene)
      renderer.render(scene, camera);
    })

//On reload
window.onbeforeunload = function(){ //Al actualizar la pagina, vuelve al scroll en 0
  window.scrollTo(0,0)
}  
  }, []);
  return (
    <div className="flex w-full flex-col containerWrapper relative "ref={containerRef}>
      <Head>
        <title>Food Recipe Generator</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"/>

      </Head>
      <main className="flex  w-full flex-col relative ">
        <canvas ref={canvasRef}/>
        <section className='one' >
          <div className="container "  >
            <div className="hero ">
            <h2 className="animate max-w-[900px] font-bold text-white ">
              Do you want to make a meal but don't know what to make?
            </h2>
            </div>
          </div>
        </section>
        <section className='two'>
          <div className="container " >
            <div className="hero ">
            <h2  className="animate nextS max-w-[900px] font-bold text-white">
            Looking for recipes on Google but missing ingredients at home?
            </h2>
            </div>
          </div>
        </section>
        <section className='three'>
          <div className="container " >
            <div className="hero  ">
            <h1  className="animate threeSection  max-w-[900px] font-bold text-white text-center ">
            Use CHATGPT3 virtual assistant to generate recipes with your current ingredients!  </h1>
            </div>
          </div>
        </section>
      </main>
       {/*CHATGPT3*/}
      
      <div className="containerGPT relative">
      <canvas ref={canvasFoodRef} className="canvasFood" data-name="canvas-food" />
        <div className="containerResponse ">
           <h3 className="text-center text-white w-full font-bold">CREATE YOUR RECIPE</h3>
           <div className="flex mt-10 items-center space-x-3 chatgpt">
             <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0 animateOpacity"
             />
             <p className="text-left font-medium text-white animateOpacity">
              Write down the ingredients you have in your fridge.       
             </p>
           </div>
         <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)} //Se almacen cada palabra agregada
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5 animateOpacity"
            placeholder={
              "Example: Avocado, 2 eggs, 240g Salmon, Soja, 2 Carrots."
            }
          />
          <div className="flex mb-5 items-center space-x-3 animateOpacity ">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium text-white">Select your type of diet.</p>
          </div>
          <div className="block animateOpacity">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />  {/*Lista de opciones, en el archivo dropDown.tsx*/}
          </div>

          {!loading && ( //Si el button no esta clickeado, NO ESTA CARGANDO.
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full "
              onClick={(e) => generateBio(e)}
            >
              Generate your food recipe &rarr;
            </button>
          )}
          {loading && ( //Despues que el button es clickeado se muestra la animaciond eCARGANDO. 
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
         <div className=" containerToaster">
         <Toaster  //Mensajes emergentes
            position="top-center"
            reverseOrder={false}
            toastOptions={{ duration: 2000 }}
          />
          {generatedBios && (
           <>
             <div className="response">
               <h3 className="sm:text-4xl text-4xl font-bold text-white text-center "ref={bioRef}>
                  YOUR FOOD RECIPE!
               </h3>
             </div>
             <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
               <div className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedBios);
                      toast("Bio copied to clipboard", { icon: "✂️",});
                       }}>
                 <p className="recipe">{generatedBios}</p>
               </div>
             </div>
           </>
          )}
         </div>
        
      </div>

    </div>
  );
};

export default Home;
