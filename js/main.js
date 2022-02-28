import { createApp } from "./vue.esm-browser.js"

const supabaseUrl = 'https://uzkhgygphepqkeknjokr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a2hneWdwaGVwcWtla25qb2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYwMzg5OTYsImV4cCI6MTk2MTYxNDk5Nn0.6r2rJflexymT_20SIm4U-fhwSe0UBKo2h-uRYpIMKV4';
const cli = supabase.createClient(supabaseUrl, supabaseKey);

createApp({
    data() {
        return {
            mensajes: [],
            nombre: "",
            nuevoMensaje: ""
        }
    },
    methods: {
        cargarmensajes: async function() {
            let { data: data, error } = await cli
                // De la tabla mensajes (Supabase), coge todas las columnas
                .from('Mensajes')
                .select('*')
                // Para que se ordene por fecha de creación
                .order('created_at', { ascending: true })
            this.mensajes = data;
        },
        enviarMensaje: async function() {
            const { data: data, error } = await cli
                // En la tabla mensajes (Supabase), metemos nuevas filas
                .from('Mensajes')
                .insert([
                    { nombre: this.nombre, texto: this.nuevoMensaje }
                    ])
            console.log(this.nuevoMensaje);
            this.nuevoMensaje = "";
        },
        // Ahora ya no hay que refrescar para que los cargue
        escucharNuevosMensajes: function() {
            cli
                .from('Mensajes')
                .on('INSERT', payload => {
                    // Añadimos nuevo mensaje
                    this.mensajes.push(payload.new);
                })
                .subscribe()
        }
    },
    watch: {
        // Vigilamos los mensajes por si hay cambios
        mensajes: {
            handler(newValue, oldValue) {
                // Desciendo el scroll cada vez que se mete un mensaje nuevo
                /* nextTick Ejecuta después de renderizar todos los mensajes */
                this.$nextTick( () => {
                    const elemento = this.$refs.mensajesContenedor;
                    // x: 0, y: la posición más baja
                    elemento.scrollTo(0, elemento.scrollHeight);
                })
            },
            deep: true
        }
    },
    mounted() {
        this.cargarmensajes();
        this.escucharNuevosMensajes();
    }
}).mount('#app')