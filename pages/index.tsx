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
  const [vibe, setVibe] = useState<VibeType>("Vegetarian"); //La forma o tipo de biografia.
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
  Tu objetivo es proporcionar una receta paso por paso basada en estos ingredientes: ${bio} Asegurate que la respuesta no exceda los 1000 caracteres y si la receta necesita coccion, aclara el tiempo y los grados a los que se deberia cocinar. ${
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
const section1Ref = useRef(null);
const section2Ref = useRef(null);
const section3Ref = useRef(null);

const sections: any = [section1Ref, section2Ref, section3Ref];

//Scroll GSAP
gsap.registerPlugin(ScrollTrigger);

useLayoutEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const h2Elements = Array.from(container.querySelectorAll('h2'));
  const h1Element = Array.from(container.querySelectorAll('h1'));
  const h3Elements = Array.from(container.querySelectorAll('h3'));

  const animate = [...h1Element, ...h2Elements,...h3Elements].flatMap((element: any) => {
    // Divide cada elemento en palabras separadas
    const words = element.textContent.split(/\s+/);
    // Reemplaza el contenido original con elementos <span> para cada palabra
    element.innerHTML = words.map((word: any) => `<span class="word">${word}</span>`).join(' ');
    // Retorna los elementos <span> para cada palabra
    return Array.from(element.querySelectorAll('.word'));
  });
  const timelines: any = [];
  animate.forEach((element: any) => {
    const timeline = gsap.timeline({
      defaults: {
        opacity: 0,
        duration: 1,
        ease: 'power4.inOut',
      },
    });
    // Aplica un retardo aleatorio a la animación de opacidad de cada palabra
    timeline.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, delay: Math.random() * 0.8 }
    );
    timelines.push(timeline);
  });

  animate.forEach((element: any, index: number) => {
    console.log(element,'element')
      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 15%',
        animation: timelines[index],
        markers: true,
        toggleActions: 'play reverse play reverse',
      });
  });

  return () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };

}, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    // Creamos una instancia de la escena y la cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, canvas.width / canvas.height, 0.1, 1000);

    // Creamos un objeto y lo agregamos a la escena (CUBO)
    // const geometry = new THREE.BoxGeometry(1,1,1,1); 
    // const material = new THREE.MeshBasicMaterial({ color: 'white' });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    //GLTF LOADER
    let chef: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
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
      // console.log('tick')
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick)
    }
    tick();
//Scroll
let scrollY = window.scrollY
let currentSection = 0
let scrollDirection: any= null


window.addEventListener('wheel', () => {

  const prevScrollY = scrollY
  scrollY = window.scrollY

  if (scrollY > prevScrollY) {
    scrollDirection = 'down'
  } else if (scrollY < prevScrollY) {
    scrollDirection = 'up'
  }
console.log(scrollDirection,'scrollDirection')
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

    if (!!chef && currentSection === 1) {
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
    }

    if (!!chef && currentSection === 2) {
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

    
    }
        }   
      })
      scene.add(glb.scene)
    })

//On reload
window.onbeforeunload = function(){ //Al actualizar la pagina, vuelve al scroll en 0
  window.scrollTo(0,0)
}  

//Sizes
const sizes = {
  width: window.innerWidth, //es el ancho disponible para la visualización de contenido en la ventana del navegador, excluyendo la barra de herramientas, las barras de desplazamiento y los bordes de la ventana. (PIXELES)
  height: window.innerHeight
}

// Movemos la cámara hacia atrás para que podamos ver el objeto
camera.position.z = 5;
//Luces.
const ambientLight = new THREE.AmbientLight(0xffffff,0.8)
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff,1)
directionalLight.position.set(1,2,0)
scene.add(directionalLight)

// Creamos un renderizador y lo agregamos al DOM
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); //habilitaría el anti-aliasing, que es una técnica utilizada para suavizar los bordes dentados en gráficos 3D. Esto puede mejorar la calidad visual de la imagen renderizada. (No todos los dispositivos aceptan esto)
                                                                        //Agregar alpha: true a las opciones del constructor haría que el canvas del WebGLRenderer fuera transparente, permitiendo que otros elementos en la página se muestren a través del canvas. Esto puede ser útil si deseas superponer la escena 3D sobre otros elementos HTML.
renderer.setSize(sizes.width, sizes.height); //Declaramos el tamano del renderizador.
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.render(scene, camera);
  }, []);
  return (
    <div className="flex w-full  flex-col containerWrapper "ref={containerRef}>
         <ScrollHandler sections={sections} />
      <Head>
        <title>Food Recipe Generator</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"/>

      </Head>
      <main className="flex  w-full flex-col relative ">
      <canvas 
      ref={canvasRef} 
  
    />
        <section className='one'>
          <div className="container " ref={section1Ref} >
            <div className="hero ">
            <h2 className="animate max-w-[900px] font-bold text-white ">
              Do you want to make a meal but don't know what to make?
            </h2>
            </div>
          </div>
        </section>
        <section className='two'>
          <div className="container "  ref={section2Ref}>
            <div className="hero ">
            <h2  className="animate nextS max-w-[900px] font-bold text-white">
            Looking for recipes on Google but missing ingredients at home?
            </h2>
            </div>
          </div>
        </section>
        <section className='three'>
          <div className="container "ref={section3Ref} >
            <div className="hero  ">
            <h1  className="animate threeSection  max-w-[900px] font-bold text-white text-center ">
            Use CHATGPT3 virtual assistant to generate recipes with your current ingredients!  </h1>
            </div>
          </div>
        </section>
        </main>
        <div className="max-w-xl w-full  self-center  containerGPT">
        <h3 className="text-center text-white w-full font-bold">CREATE YOUR RECIPE</h3>
          <div className="flex mt-10 items-center space-x-3 chatgpt">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
             Write down the ingredients you have in your fridge.
              {/* <span className="text-slate-500">
                (or write a few sentences about yourself)
              </span> */}
              
            </p>
          </div>

          {/*CHATGPT3*/}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)} //Se almacen cada palabra agregada
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5 "
            placeholder={
              "Example: Avocado, 2 eggs, 240g Salmon, Soja, 2 Carrots."
            }
          />
          <div className="flex mb-5 items-center space-x-3 ">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your type of diet.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />  {/*Lista de opciones, en el archivo dropDown.tsx*/}
          </div>

          {!loading && ( //Si el button no esta clickeado, NO ESTA CARGANDO.
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
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
        <Toaster  //Mensajes emergentes
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {/* <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" /> */}
        <div className="space-y-10 my-10">
        {generatedBios && (
  <>
    <div className="response">
      <h3
        className="sm:text-4xl text-4xl font-bold text-white text-center "
        ref={bioRef}
      >
        YOUR FOOD RECIPE!
      </h3>
    </div>
    <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
      <div
        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
        onClick={() => {
          navigator.clipboard.writeText(generatedBios);
          toast("Bio copied to clipboard", {
            icon: "✂️",
          });
        }}
      >
        <p className="recipe">{generatedBios}</p>
      </div>
    </div>
  </>
)}
        </div>
      
    </div>
  );
};

export default Home;
