# **PROJECT\_MANIFESTO.md (v3.0 \- Unified Sovereign Spec)**

## **1\. Preámbulo: La Convergencia de la Realidad Simulada**

### **1.1. Identidad del Documento y Propósito Soberano**

Este documento constituye la **Especificación Soberana Unificada (v3.0)** para el proyecto **Dungeon Cortex**. Representa la culminación de un proceso iterativo de ingeniería y diseño filosófico, fusionando, reemplazando y superando a todas las directivas anteriores, incluyendo el 'Unified Architecture Manifesto' (v1.0), las especificaciones de producción (v2.1) y la documentación de ingeniería de 'Project Dungeon Master' (v15.0).  
La clasificación de este archivo es **FUENTE DE VERDAD TÉCNICA (SSOT) – NIVEL: ARQUITECTO SUPREMO**. En el contexto operativo de un Entorno de Desarrollo Agéntico, específicamente bajo la infraestructura de **Google Antigravity** y metodologías de "Vibe Coding", este manifiesto no es una sugerencia; es la ley inmutable que gobierna la generación de código, la arquitectura de sistemas y la toma de decisiones de los agentes autónomos involucrados en la construcción del proyecto.  
Nuestra misión trasciende la creación de un simple "chatbot" o una herramienta de gestión de campañas. El objetivo es construir un **Motor de Realidad Simulada** para Juegos de Rol de Mesa (TTRPG). Dungeon Cortex busca resolver la tensión fundamental, conocida como la "Paradoja del DM", entre la creatividad ilimitada y alucinatoria de la Inteligencia Artificial Generativa y la rigidez matemática y determinista de las reglas de *Dungeons & Dragons 5th Edition* (SRD 5.1). En este sistema, la IA gestiona la realidad, la atmósfera y la narrativa, pero el Código Determinista gobierna la física, la causalidad y la ley.

### **1.2. La Visión: La Reliquia Arcana vs. El Paradigma SaaS**

El mercado actual de herramientas digitales para juegos de rol, ejemplificado por plataformas como D\&D Beyond, Roll20 o Foundry VTT, sufre de un error categórico fundamental: tratan la magia de la narración como un problema administrativo. Sus interfaces son densas, repletas de hojas de cálculo, menús desplegables y bases de datos visibles que rompen la "suspensión de la incredulidad" necesaria para la inmersión profunda.  
**Dungeon Cortex rechaza el paradigma SaaS (Software as a Service).** No estamos construyendo software de productividad; estamos forjando una **Reliquia Arcana**.

* **Atmósfera:** La estética visual y narrativa se adhiere estrictamente al "Visceral Dark Fantasy". El mundo que simulamos es antiguo, hostil, sucio y peligroso. No hay lugar para el diseño plano ("Flat Design") estéril y corporativo.  
* **La Regla de Oro de la Interfaz:** La interfaz debe ser invisible o diegética. No debe haber distinción entre la herramienta y el juego.  
  * Si el personaje está herido, no nos limitamos a decrementar un contador numérico de Puntos de Golpe (HP); los bordes de la pantalla deben teñirse de carmesí mediante viñetas CSS dinámicas, y el texto narrativo puede volverse errático.  
  * Si el personaje está bajo los efectos de la ceguera, el mapa no muestra un icono de "Ojo tachado"; el renderizado del mapa se oscurece físicamente, reduciendo el radio de visión del jugador en tiempo real.  
  * La UI es una extensión del sistema nervioso del avatar, no un panel de control para el usuario.

Esta filosofía de diseño exige una arquitectura técnica que soporte la reactividad en tiempo real sin sacrificar la profundidad de la simulación. No buscamos la eficiencia administrativa, sino la **Inmersión Cognitiva**.

## **2\. Filosofía del Sistema: Las Leyes de Hierro (The Iron Laws)**

Para mitigar los riesgos inherentes al uso de Grandes Modelos de Lenguaje (LLMs) en sistemas lógicos —específicamente la alucinación de datos y la inconsistencia numérica—, el sistema Dungeon Cortex se adhiere a tres leyes inmutables. Estas leyes actúan como "guardarraíles" lógicos y ontológicos que ningún agente, humano o artificial, tiene permiso para transgredir.

### **2.1. PRIMERA LEY: Code is Law (El Código es la Ley)**

La Jerarquía de Autoridad en Dungeon Cortex es absoluta y unidireccional: **La IA Narra, el Código Resuelve.**  
En los intentos previos de "Dungeon Masters con IA", el error común ha sido permitir que el modelo de lenguaje decida el resultado de las acciones (ej. preguntar a GPT-4 "¿Golpeé al orco?"). Esto resulta inevitablemente en narrativas incoherentes donde los números no cuadran o las reglas se doblan por conveniencia dramática. Dungeon Cortex invierte este flujo.

* **El Interceptor Determinista:** El Agente Narrativo (Chronos) tiene libertad total para describir la "furia asesina en los ojos del orco" o "el destello del acero bajo la luna", pero tiene **cero autoridad mecánica**. El LLM nunca debe calcular mentalmente el resultado de una acción ni tirar dados virtuales.  
* **Ejecución del Flujo de Verdad:**  
  1. **Input:** El jugador declara su intención en lenguaje natural: "Ataco al goblin con mi espada larga".  
  2. **Interceptación:** El sistema analiza la intención y selecciona la herramienta de código apropiada (Pattern "Tool-Use First").  
  3. **Cálculo:** El backend (Python) ejecuta la función determinista combat.resolve\_attack(). Este script consulta la Clase de Armadura (AC) del objetivo en la base de datos, ejecuta random.randint(1,20) y suma los modificadores de fuerza del personaje.  
  4. **Output:** El código genera un objeto JSON puro e inmutable: {success: true, damage: 12, damage\_type: "slashing", crit: false, target\_remaining\_hp: 3}.  
  5. **Narración:** Solo entonces, la IA recibe este JSON ("Fact Packet") y lo traduce a prosa inmersiva: "Tu hoja encuentra un hueco en su armadura oxidada, cortando profundamente su hombro. La criatura chilla, tambaleándose pero aún en pie.".

### **2.2. SEGUNDA LEY: State is Truth (El Estado es la Verdad)**

La Inteligencia Artificial es, por definición en esta arquitectura, **stateless** (sin estado). No tiene memoria persistente fiable entre ciclos de inferencia más allá de su ventana de contexto inmediata.

* **Persistencia Sagrada:** La Base de Datos (PostgreSQL/Supabase) es la única fuente de verdad (Source of Truth). Si un objeto no existe como un registro en la tabla inventory de la base de datos SQL, no existe en el universo del juego.  
* **Prohibición de la "Deus Ex Machina":** La IA no tiene permiso para "inventar" una poción de curación en el bolsillo del jugador para salvarlo en un momento dramático si el item\_count en la base de datos es menor que 1\.  
* **Validación Estricta:** Antes de que el Agente Narrativo pueda describir el uso de un recurso (lanzar un hechizo, beber una poción, disparar una flecha), el sistema debe consultar y validar el estado en la DB. Si la validación falla (ej. "No quedan espacios de conjuro de nivel 3"), la acción se rechaza a nivel de sistema, y la IA debe narrar el fallo: "Intentas canalizar la energía arcana, pero tu mente está agotada. El hechizo se desvanece antes de formarse.".

### **2.3. TERCERA LEY: Diegetic UI (Interfaz Diegética)**

La interfaz de usuario no es un añadido estético; es el medio principal de comunicación del estado del juego y debe maximizar la inmersión.

* **Prohibición SaaS:** Queda terminantemente prohibido el uso de componentes visuales que recuerden a software empresarial. No habrá tablas de datos visibles, paginación estándar, ni menús desplegables nativos del sistema operativo.  
* **Skeuomorfismo Refinado:** La estética debe evocar un "grimorio interactivo". Los botones deben tener peso visual y texturas; las cartas de inventario deben proyectar sombras realistas.  
* **Feedback Visceral y Multimodal:** El estado del personaje dicta el renderizado de la ventana gráfica.  
  * *Daño Crítico:* La pantalla debe sacudirse violentamente (implementado vía CSS shake animation y Framer Motion).  
  * *Muerte:* La interfaz se desatura progresivamente hasta alcanzar el blanco y negro (filtro CSS grayscale), silenciando la música ambiental.  
  * *Estados Alterados:* Si el personaje está envenenado, superposiciones SVG de venas verdosas deben pulsar en la visión periférica del usuario.

## **3\. Arquitectura Técnica: El Cuerpo (The Body)**

El sistema Dungeon Cortex opera como una aplicación híbrida en tiempo real de alta complejidad. Rechazamos las arquitecturas monolíticas en favor de una estrategia de **Monorepo** que integra servicios especializados y submódulos de la comunidad open source verificada.

### **3.1. Stack Tecnológico (The Tech Stack)**

La selección de tecnologías no es arbitraria; cada componente ha sido elegido para soportar las *Leyes de Hierro*, específicamente la necesidad de validación determinista y la reactividad de la interfaz.

| Componente | Tecnología Seleccionada | Justificación Técnica y Soberana | Fuente |
| :---- | :---- | :---- | :---- |
| **Frontend (The Visage)** | **Next.js 14+ (App Router)** | Necesitamos un renderizado híbrido (Server Components para SEO/Velocidad inicial, Client Components para interactividad). El ecosistema de React permite animaciones complejas (Framer Motion) y gestión de estado avanzada. |  |
| **Estilos & UI** | **Tailwind CSS \+ Shadcn/UI** | Permite una personalización extrema requerida para la estética "Dark Fantasy" (\#1a1a1d, \#c5a059) manteniendo un código mantenible y responsivo. |  |
| **Backend (The Engine)** | **FastAPI (Python 3.12+)** | Python es el lenguaje nativo de la IA. FastAPI ofrece el mayor rendimiento, tipado fuerte (Pydantic) para validación de datos SRD, y soporte nativo para asincronía (Websockets). |  |
| **Protocolo de Sincronización** | **AG-UI (Agent-User Interaction)** | REST es insuficiente. Necesitamos Websockets bidireccionales para el "streaming" de componentes UI y parches de estado (JSON Patch) en tiempo real. |  |
| **Base de Datos** | **PostgreSQL (Supabase)** | Modelo relacional robusto para reglas estrictas (SQLModel) \+ Capacidad vectorial (pgvector) para la memoria semántica y el RAG. |  |
| **Orquestación IA** | **Google Antigravity** | Entorno de desarrollo "Agent-First". Permite la gestión de múltiples agentes, generación de artefactos de prueba y modos de planificación complejos. |  |

### **3.2. Estructura del Monorepo Soberano**

El proyecto se organiza para facilitar el desarrollo agéntico, separando claramente la lógica de reglas (inmutable) de la lógica de aplicación y la configuración de agentes.  
/dungeon-cortex-monorepo ├──.agent/ \# Configuración y Cerebro de Google Antigravity │ ├── skills/ \# Habilidades modulares (Narrator, Mechanic, Cartographer) │ │ ├── combat/ \# Lógica de combate y resolución │ │ ├── map/ \# Control de Azgaar y Playwright │ │ └── inventory/ \# Generación de loot y transacciones │ └── workflows/ \# Flujos de trabajo automatizados (CI/CD agéntico) ├── apps/ │ ├── web-client/ \# Next.js 14 (Frontend \- The Visage) │ │ ├── src/components/ \# PaperDoll, StoryLog, HexMap, VitalsPanel │ │ ├── src/hooks/ \# useAgentState (Lógica cliente AG-UI) │ │ └── tailwind.config.js \# Configuración de paleta Dark Fantasy │ └── docs/ \# Documentación técnica viva (este manifiesto) ├── packages/ │ ├── engine/ \# Lógica pura D\&D 5e (Python \- The Engine) │ │ ├── combat.py \# Resolución determinista de ataques │ │ ├── dice.py \# RNG criptográficamente seguro │ │ └── rules.py \# Validadores contra SRD 5.1 │ ├── agent-core/ \# Orquestación LangGraph y Prompts del Triunvirato │ └── db-schema/ \# Modelos SQLModel compartidos (Single Source of Truth) ├── external-sources/ \# Submódulos Git (Referencia de Solo Lectura) │ ├── 5e-srd-api/ \# Reglas base estructuras (JSON) \[5e-bits\] │ ├── 5e-database-spanish/ \# Localización y traducción \[Magical20-ai\] │ └── fantasy-map-generator/ \# Lógica de generación de mapas \[Azgaar\] └── PROJECT\_MANIFESTO.md \# ESTE ARCHIVO (La Ley)

## **4\. La Arquitectura de Agentes: El Triunvirato (The Triumvirate)**

La complejidad de dirigir una campaña de rol supera la capacidad de una ventana de contexto única. Intentar que un solo modelo sea narrador, árbitro, cartógrafo y diseñador gráfico conduce inevitablemente a la degradación del rendimiento y alucinaciones. Dungeon Cortex implementa una arquitectura de **"Triunvirato de Agentes"**, orquestada por un **Agent Manager** central. Esta estructura imita la división cognitiva de tareas en una mesa de juego real asistida por herramientas.

### **4.1. Agente 1: LOGIC CORE (El Abogado de Reglas)**

* **Rol:** Motor de cálculo determinista, validador de legalidad y gestor de estado mecánico.  
* **Naturaleza:** Rígido, no creativo, frío. No "piensa", solo "calcula". Es el guardián de la *Primera Ley*.  
* **Fuentes de Datos (Whitelisted Repos):**  
  * **Reglas Base:** Consume directamente 5e-bits/5e-srd-api para obtener la estructura JSON canónica de monstruos, hechizos y objetos. Esto asegura que un "Goblin" siempre tenga las estadísticas oficiales.  
  * **Localización:** Utiliza Magical20-ai/5e-database-spanish para realizar el mapeo terminológico en tiempo real (ej. mapear el input "Bola de Fuego" al ID spell\_fireball).  
* **Responsabilidad:** Cuando el jugador realiza una acción, *Logic Core* calcula el resultado matemático.  
* **Output:** JSON Estructurado, nunca texto narrativo.  
  * *Ejemplo de Output:*  
    `{`  
      `"action_type": "attack",`  
      `"attacker": "hero_01",`  
      `"target": "goblin_sniper_02",`  
      `"roll_total": 19,`  
      `"ac_target": 15,`  
      `"hit": true,`  
      `"damage_total": 8,`  
      `"damage_type": "piercing",`  
      `"target_status": "alive",`  
      `"remaining_hp": 2`  
    `}`

### **4.2. Agente 2: CHRONOS (El Narrador)**

* **Rol:** Interfaz de lenguaje natural, memoria semántica, atmósfera y "alma" del juego.  
* **Tecnología:** Gemini 3 Pro optimizado con arquitectura RAG (Retrieval-Augmented Generation).  
* **Sistemas de Memoria (RAG):**  
  * *Memoria de Trabajo:* Mantiene los últimos 20-50 turnos de interacción inmediata (Context Window) para coherencia a corto plazo.  
  * *Memoria Semántica:* Utiliza búsquedas de similitud vectorial en pgvector sobre resúmenes de sesiones pasadas. Esto le permite responder preguntas como "¿Qué le prometimos al Duque hace tres meses?" recuperando el contexto relevante sin saturar la ventana actual.  
  * *Memoria de Entidad:* Antes de generar un diálogo para un NPC, consulta su estado emocional y relacional en la base de datos SQL (ej. npc\_attitude: hostile).  
* **Output:** Texto enriquecido (Markdown) con un tono visceral y widgets interactivos incrustados. *Chronos* toma el JSON frío de *Logic Core* y lo transforma en: *"Tu flecha silba en el aire y se clava en el hombro del goblin. La criatura gruñe, herida pero aún peligrosa."*.

### **4.3. Agente 3: VISUAL VAULT (El Secretario Visual)**

* **Rol:** Generación de assets visuales en tiempo real, gestión espacial y mantenimiento de la consistencia estética.  
* **Tecnología:** Nano Banana Pro / Imagen 3\.  
* **Fuentes de Datos y Herramientas:**  
  * *Mapas:* Interactúa con Azgaar/Fantasy-Map-Generator para obtener exportaciones vectoriales (.svg/.json) y coordenadas de navegación.  
  * *Tokens:* Utiliza lógica de Cellule/dndGenerator para definir atributos visuales de NPCs antes de generarlos.  
* **Pipeline de Generación Consistente:**  
  1. **Recepción de Contexto:** Recibe un objeto del botín generado, ej. "Espada larga oxidada encontrada en una ciénaga".  
  2. **Ingeniería de Prompt (Nano Banana):** Construye un prompt optimizado para consistencia de estilo: *"Isometric RPG item icon, rusted longsword, swamp mud traces, dark fantasy style, worn texture, transparent background, high fidelity"*.  
  3. **Generación y Almacenamiento:** Genera la imagen, la guarda en un bucket de almacenamiento persistente y devuelve la URL para que sea insertada en la base de datos InventoryItem.

## **5\. Ingeniería de Datos y Protocolos de Verdad (The Memory)**

La persistencia es el cimiento de la *Segunda Ley*. Dungeon Cortex utiliza **SQLModel** (una capa moderna sobre SQLAlchemy y Pydantic) para definir esquemas que sirven doble propósito: definir la estructura de las tablas en PostgreSQL y validar los datos en la API de Python.

### **5.1. Mecánicas del SRD (Solo Lectura)**

Esta tabla actúa como la enciclopedia de reglas del sistema. Es poblada exclusivamente por procesos ETL (Extract, Transform, Load) desde los repositorios comunitarios al iniciar el sistema o durante actualizaciones de mantenimiento. No se modifica durante el juego.  
`class SrdMechanic(SQLModel, table=True):`  
    `"""Fuente de Verdad de Reglas (Read-Only)"""`  
    `id: str = Field(primary_key=True)       # ej: "spell_fireball", "monster_goblin"`  
    `type: str                               # "monster", "spell", "item", "class_feature"`  
      
    `# Datos Crudos (Fuente: 5e-bits/5e-srd-api)`  
    `data_json: Dict = Field(sa_type=JSONB)`    
      
    `# Datos Localizados (Fuente: Magical20-ai/5e-database-spanish)`  
    `data_es: Dict = Field(sa_type=JSONB)`      
      
    `# Búsqueda Híbrida`  
    `search_vector: Any                      # TSVector para búsqueda full-text eficiente`

.

### **5.2. Estado del Jugador (Player State)**

Esta tabla contiene el "estado vivo" del personaje. Los valores derivados (como HP actual) son modificados exclusivamente por eventos validados del *Logic Core*.  
`class Character(SQLModel, table=True):`  
    `"""Estado Vivo del Avatar"""`  
    `id: UUID = Field(primary_key=True)`  
    `name: str`  
      
    `# Atributos Base (Inmutables salvo Level Up)`  
    `stats: Dict = Field(sa_type=JSONB)      # {str: 18, dex: 12, con: 14...}`  
      
    `# Estado Vivo (Sincronizado vía AG-UI State Patches)`  
    `hp_current: int`  
    `hp_max: int`  
    `conditions: List[str] = Field(sa_type=JSONB) # ["blinded", "poisoned", "prone"]`  
      
    `# Ubicación Espacial`  
    `location_cell_id: int                   # Referencia al ID de celda en mapa Azgaar`  
    `active_scene_id: Optional         # Referencia a la escena narrativa actual`

.

### **5.3. Inventario Posicional (Paper Doll)**

El inventario en Dungeon Cortex no es una lista abstracta; es un sistema físico de espacios limitados ("Slot-based inventory"). Esto fuerza decisiones tácticas al jugador.  
`class ItemLocation(str, Enum):`  
    `EQUIPPED = "equipped"`  
    `BACKPACK = "backpack"`  
    `STASH = "stash"`

`class InventoryItem(SQLModel, table=True):`  
    `"""Instancia física de un objeto"""`  
    `id: UUID = Field(primary_key=True)`  
    `character_id: UUID = Field(foreign_key="character.id")`  
    `template_id: str = Field(foreign_key="srdmechanic.id")`   
      
    `# Lógica Visual y Posicional`  
    `location: ItemLocation`  
    `slot_type: Optional[str]    # "head", "main_hand", "torso", "ring_1"`  
    `grid_index: Optional[int]   # 0-19 (Índice para la cuadrícula de la mochila)`  
      
    `# Estado de la Instancia`  
    `current_charges: int        # Para varitas/bastones con cargas limitadas`  
    `is_identified: bool         # Para mecánicas de identificación de objetos mágicos`  
    `custom_name: Optional[str]  # Si el jugador renombra su espada`  
    `visual_asset_url: str       # Icono generado por Visual Vault`

.

## **6\. El Protocolo AG-UI: El Sistema Nervioso**

Para lograr la "Inmersión Cognitiva" y cumplir con la *Tercera Ley*, la comunicación entre el cerebro (Backend IA) y el rostro (Frontend UI) debe ser instantánea y fluida. Las arquitecturas REST tradicionales (Request/Response) introducen una latencia inaceptable que rompe la ilusión.  
Dungeon Cortex implementa el protocolo **AG-UI (Agent-User Interaction)**. Este protocolo estándariza el streaming de eventos sobre Websockets, permitiendo una sincronización de estado bidireccional y reactiva.

### **6.1. Arquitectura de Eventos y Sincronización**

El backend mantiene una conexión Websocket persistente con el cliente. A través de este canal, transmite una secuencia ordenada de eventos JSON que pueden contener texto narrativo, cambios de estado o comandos de interfaz.

#### **A. Evento NARRATIVE\_CHUNK (La Voz)**

Transmite fragmentos de texto generados por *Chronos*.

* **Payload:** { "text": "La poción sabe a... ", "done": false, "id": "msg\_123" }  
* **Comportamiento Frontend:** El componente StoryLog acumula estos fragmentos y los renderiza con un efecto de "máquina de escribir", asegurando que el jugador lea al ritmo de la generación.

#### **B. Evento STATE\_PATCH (El Cuerpo)**

Utiliza el estándar **JSON Patch (RFC 6902\)** para actualizar el estado del cliente de forma quirúrgica y eficiente.

* **Payload:** \[{ "op": "replace", "path": "/character/hp\_current", "value": 15 }\]  
* **Comportamiento Frontend:** La barra de vida del jugador se actualiza (baja) instantáneamente.  
* **Importancia de la Intercalación:** Este evento puede enviarse *mientras* se está transmitiendo un NARRATIVE\_CHUNK.  
  * *Escenario:* La IA narra "El orco te golpea brutalmente...". Justo en ese momento, se envía el STATE\_PATCH. La barra de vida baja. Luego, la IA continúa: "...dejándote sin aliento".  
  * *Impacto:* El jugador siente el golpe (visualmente) antes de terminar de leerlo, simulando la inmediatez del dolor físico.

#### **C. Evento SHOW\_WIDGET (La Interacción)**

Permite al agente invocar interfaces gráficas complejas en lugar de solo texto.

* **Payload:**  
  `{`  
    `"widget_type": "loot_modal",`  
    `"data": {`  
      `"title": "Cofre Antiguo",`  
      `"items": [`  
        `{ "id": "item_55", "name": "50 Monedas de Oro", "icon": "/assets/gold.png" },`  
        `{ "id": "item_56", "name": "Poción de Curación", "icon": "/assets/potion_red.png" }`  
      `]`  
    `}`  
  `}`

* **Comportamiento Frontend:** Se renderiza un modal interactivo sobre la pantalla, permitiendo al jugador arrastrar los objetos a su inventario usando dnd-kit. Esto reemplaza el tedioso comando de texto "recoger todo".

### **6.2. Optimistic UI y Manejo de Latencia**

Para acciones de gestión de inventario, el sistema utiliza "Optimistic UI".

1. El jugador arrastra una espada a la mano principal.  
2. La UI actualiza el estado visual inmediatamente (la espada se "pega" al slot).  
3. En segundo plano, se envía el evento al backend.  
4. Si *Logic Core* valida la acción (ej. "El personaje tiene competencia"), confirma el cambio.  
5. Si rechaza la acción (ej. "No puedes equipar esto en combate"), envía un STATE\_PATCH revertiendo el cambio y un mensaje de error "toast".

## **7\. Experiencia de Usuario: El Tríptico Visual (The Triptych)**

La pantalla se divide rígidamente en tres paneles funcionales para gestionar la alta densidad de información de un RPG sin abrumar al jugador. Este diseño, denominado "El Tríptico", asegura que la información mecánica, narrativa y contextual tenga su propio espacio dedicado.

### **7.1. Panel Izquierdo: El Avatar (HUD)**

* **Propósito:** Monitorización de signos vitales inmediatos y constantes.  
* **Componentes:**  
  * *Retrato Dinámico:* Imagen generada por IA que cambia sutilmente según el estado de salud (Sano \-\> Magullado \-\> Ensangrentado \-\> Moribundo).  
  * *Barras Vivas:* Salud (Rojo Oscuro) y Recursos (Azul para Maná/Energía, Gris para Stamina). Estas barras no son estáticas; están animadas con framer-motion para mostrar el daño "golpeando" la barra antes de que esta descienda.  
  * *Indicadores de Estado:* Iconos pulsantes para buffs/debuffs. En concordancia con la UI Diegética, si el personaje está "Cegado", este panel permanece claro mientras el resto de la interfaz se desenfoca o se oscurece.

### **7.2. Panel Central: El Oráculo (Story Log)**

* **Propósito:** El flujo principal de la realidad simulada.  
* **Tecnología:** Feed infinito con scroll automático y gestión de renderizado híbrido.  
* **Texto Enriquecido y Widgets:** El texto narrativo no es plano. Las tiradas de ataque, cheques de habilidad y salvaciones aparecen como **widgets interactivos** incrustados dentro de la prosa.  
  * *Ejemplo:* "El goblin te lanza una jabalina.. Sientes un dolor agudo..."  
  * Al pasar el mouse sobre el widget, se desglosa la matemática: 1d20 (14) \+ 4 (DES) \= 18\. Transparencia total.  
* **Tipografía:** Fuente *Inter* para lectura mecánica y descripciones de sistema; fuente *Cinzel* para eventos dramáticos, títulos de escenas y diálogos de deidades.

### **7.3. Panel Derecho: El Grimorio (Contexto Polimórfico)**

Este panel es inteligente y polimórfico; cambia su contenido y funcionalidad automáticamente según el contexto de la acción del jugador, eliminando la necesidad de navegar por menús.

#### **A. Modo Exploración (Estado Default)**

Muestra el **Visor de Mapa** interactivo impulsado por la integración con Azgaar.

* El mapa renderiza la geografía local.  
* Los nodos de ciudades o puntos de interés son elementos clicables. Al hacer clic, se inicia un evento de "Viaje" que *Logic Core* procesa (calculando distancia y tiempo) y *Chronos* narra.

#### **B. Modo Combate (Trigger: Iniciativa Activa)**

Se transforma en el **Bestiario**. Muestra tarjetas de datos de los enemigos visibles.

* **Niebla de Guerra de Datos:** Las estadísticas del enemigo (HP, AC, Resistencias) aparecen inicialmente como ?.  
* **Revelación Progresiva:** Solo se revelan cuando el jugador las descubre empíricamente.  
  * Si el jugador ataca con 14 y falla, y luego con 16 y acierta, el sistema puede revelar: AC: 15-16.  
  * Si el jugador usa fuego y el daño se reduce, se revela: Resistencia: Fuego.

#### **C. Modo Gestión (Trigger: Abrir Inventario)**

Se transforma en el sistema **"Paper Doll"**.

* Muestra la silueta anatómica central del personaje con slots de equipo (Cabeza, Torso, Manos, Pies, Anillos).  
* Debajo, una cuadrícula (Grid) que representa la mochila.  
* La interacción es puramente **Drag-and-Drop** usando la librería dnd-kit. Arrastrar una poción desde la mochila a la boca del personaje (en el retrato) es una acción válida para consumirla.

## **8\. Habilidades Agénticas y Flujos de Trabajo (Agent Skills)**

En el entorno de **Google Antigravity**, la inteligencia del sistema no reside en un prompt gigante y monolítico. Se modulariza en "Habilidades" (Skills) definidas en archivos Markdown (SKILL.md) que el Agente Manager carga y descarga dinámicamente según la necesidad semántica. Esto previene la contaminación del contexto y asegura que el agente tenga instrucciones precisas para la tarea en mano.

### **8.1. Skill: The Cartographer (.agent/skills/map/SKILL.md)**

* **Trigger Semántico:** "Viajo a...", "¿Dónde estoy?", "Mirar mapa", "Explorar norte".  
* **Herramientas:** Browser Subagent (Playwright), API Azgaar.  
* **Flujo de Lógica:**  
  1. Cargar el archivo .map de la campaña en una instancia de navegador headless (Playwright).  
  2. Ejecutar scripts JS inyectados para ocultar la UI de edición de Azgaar y centrar la cámara en las coordenadas character.location\_cell\_id.  
  3. Ajustar el zoom y las capas visibles (biomas, fronteras, etiquetas) según la percepción del personaje.  
  4. Tomar una captura de pantalla de alta resolución (Viewport Screenshot).  
  5. Enviar la imagen procesada al frontend vía evento AG-UI MAP\_UPDATE y devolver una descripción textual de la geografía a *Chronos* para la narración.

### **8.2. Skill: The Arbiter (.agent/skills/combat/SKILL.md)**

* **Trigger Semántico:** "Ataco", "Lanzo hechizo", "Uso habilidad", "Esquivo".  
* **Flujo de Lógica (Tool-Use First):**  
  1. **Identificación de Intención:** El agente analiza el lenguaje natural: "Quiero clavarle mi daga al orco". Traduce esto a parámetros: Action: Attack, Target: Orc\_01, Weapon: Dagger.  
  2. **Consulta de Datos:** Consulta la base de datos para obtener la AC del Orco y el Bonus de Ataque/Daño del Jugador para la Daga.  
  3. **Ejecución Determinista:** Llama a la función Python engine.combat.attack().  
     * roll \= random.randint(1, 20\)  
     * total \= roll \+ modifiers  
     * is\_hit \= total \>= target\_ac  
     * damage \= calculate\_damage()  
  4. **Aplicación de Estado:** Si impacta, reduce el HP del objetivo en la DB.  
  5. **Retorno:** Devuelve el JSON {hit: true, damage: 4, type: "piercing"} a *Chronos*..

### **8.3. Skill: The Treasurer (.agent/skills/inventory/SKILL.md)**

* **Trigger Semántico:** "Saqueo el cuerpo", "Abro el cofre", "Busco en la habitación".  
* **Flujo de Lógica (Loot Goblin):**  
  1. **Cálculo de Recompensa:** Recibe el CR (Challenge Rating) del encuentro o la dificultad de la cerradura.  
  2. **Consulta de Tablas:** Consulta las tablas de loot ponderadas (algoritmo basado en la lógica de *Donjon*) en la base de datos SRD.  
  3. **Generación de Instancias:** Crea registros nuevos en la tabla InventoryItem.  
  4. **Generación Visual:** Invoca al agente *Visual Vault* para generar iconos únicos para los objetos mágicos o raros usando Nano Banana Pro ("Worn texture, isometric icon, magical glow").  
  5. **Actualización UI:** Envía un evento SHOW\_WIDGET con el contenido del botín al jugador.

## **9\. Protocolo de Auto-Despliegue y Ciclo de Vida (Bootstrap Protocol)**

**DIRECTIVA PRIORITARIA AL AGENTE MANAGER:** Al inicializar este proyecto en un nuevo entorno, se debe ejecutar la siguiente secuencia de construcción estricta. La improvisación en la fase de cimientos está prohibida. Sigue el plan.

### **Fase 1: Andamiaje (Scaffolding)**

1. **Inicialización del Monorepo:** Crear la estructura de directorios definida en la Sección 3.2, estableciendo apps/web-client (Next.js) y packages/engine (Python).  
2. **Configuración de Antigravity:** Activar el "Planning Mode" en Google Antigravity. Generar un artefacto "Implementation Plan" detallando las dependencias y versiones.  
3. **Instalación de Dependencias Críticas:**  
   * *Backend:* fastapi, uvicorn, sqlmodel, playwright, pgvector.  
   * *Frontend:* framer-motion, dnd-kit, socket.io-client, lucide-react.

### **Fase 2: Ingesta de Conocimiento (Knowledge Ingestion)**

1. **Clonado de Fuentes:** Clonar los repositorios whitelist: 5e-bits/5e-srd-api y Magical20-ai/5e-database-spanish en la carpeta external-sources.  
2. **Pipeline ETL:** Ejecutar el script scripts/ingest\_srd.py.  
   * Este script debe leer los JSONs en inglés de 5e-bits.  
   * Cruzar los IDs con los archivos de Magical20 para inyectar las traducciones al español.  
   * Insertar los registros consolidados en la tabla SrdMechanic de la base de datos local (SQLite para dev, Postgres para prod).  
3. **Verificación de Integridad:** Ejecutar un test de consulta: Asegurar que el hechizo "Fireball" existe, tiene su contraparte "Bola de Fuego" en data\_es, y sus datos de daño (8d6) son correctos.

### **Fase 3: Lógica y Núcleo (Logic Core Implementation)**

1. **Implementación del Motor:** Desarrollar backend/src/engine/combat.py implementando la lógica determinista de D\&D 5e.  
2. **Pruebas Unitarias:** Crear y pasar tests unitarios exhaustivos para las funciones de dados y resolución de daño. **El código debe pasar los tests (Green Light) antes de conectar cualquier LLM.** Un fallo en la lógica de dados es inaceptable.  
3. **Memoria Semántica:** Configurar la extensión pgvector en PostgreSQL y crear los índices necesarios para la búsqueda de lore.

### **Fase 4: Integración Visual (The Visage)**

1. **Componentes UI:** Implementar el componente StoryLog con soporte para el streaming de eventos AG-UI (Typewriter effect).  
2. **Sistema de Inventario:** Construir la interfaz "Paper Doll" en React utilizando dnd-kit, asegurando que los eventos onDragEnd emitan las señales correctas al backend.  
3. **Conexión Websocket:** Configurar el servidor Websocket en server.py y validar la recepción y manejo correcto de eventos STATE\_PATCH en el cliente.

### **Fase 5: Activación del Triunvirato y Validación**

1. **Credenciales:** Configurar las API Keys seguras para Gemini 3 Pro (Chronos) y Nano Banana Pro (Visual Vault).  
2. **Simulación de Batalla:** Desplegar los agentes y realizar una prueba de integración completa generando un "Walkthrough Artifact" en Antigravity. El agente debe simular un combate completo, desde la iniciativa hasta el botín, verificando que la narración coincide con los logs mecánicos y que la UI se actualiza en tiempo real.

**FIN DEL MANIFIESTO.** Este documento es la Ley Suprema del proyecto Dungeon Cortex. Cualquier desviación de estas especificaciones requiere la aprobación explícita y documentada del Arquitecto Supremo. Ejecuta la visión. Construye la Reliquia.

#### **Obras citadas**

1\. Getting Started with Google Antigravity, https://codelabs.developers.google.com/getting-started-google-antigravity 2\. Getting Started | D\&D 5e SRD API, https://5e-bits.github.io/docs/tutorials/beginner/getting-started 3\. Nano Banana Pro (Gemini 3 Pro image): 4K AI Image Generator | Higgsfield, https://higgsfield.ai/nano-banana-2-intro 4\. State Management \- Agent User Interaction Protocol, https://docs.ag-ui.com/concepts/state 5\. AG-UI: A Lightweight Protocol for Agent-User Interaction \- DataCamp, https://www.datacamp.com/tutorial/ag-ui 6\. Authoring Google Antigravity Skills, https://codelabs.developers.google.com/getting-started-with-antigravity-skills 7\. Google Antigravity Skills Update — The AI That Codes, Tests, and Learns for You \- Reddit, https://www.reddit.com/r/AISEOInsider/comments/1qt1tx8/google\_antigravity\_skills\_update\_the\_ai\_that/ 8\. Award Treasure and Magic Items in 5e: SlyFlourish.com, https://slyflourish.com/awarding\_magic\_items.html