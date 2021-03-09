<script>
    export let width = "20px"
    export let color = "var(--color-secondary)"
    export let direction = "up"
    export let shake = false;
    export let fire = true;
    export let blastOff = false;

    //Bindings
    let rocket

    const directions = {
        "up": 323,
        "up-right": 0,
        "right": 53,
        "down-right": 90,
        "down": 143,
        "down-left": 180,
        "left": 233,
        "up-left": 270
    }
    
</script>

<style>
    .rocket{
        position: relative;
    }
	.shake{
        animation: shake 0.5s ease-in-out infinite;
    }
    .blast-off{
        animation: fire 1s ease-in-out infinite;
    }
    .no-fire{
        display: none;
    }
    @keyframes shake {
        0% { transform: rotate(323deg);}
        33% { transform: rotate(322deg); }
        66% { transform: rotate(323deg); }
        100% { transform: rotate(324deg); }
    }
    @keyframes fire {
        0% { fill: red;}
        33% { fill:yellow; }
        66% { fill:red; }
        100% { fill: orange; }
    }
</style>

<svg {width}  fill={color} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"
    class:shake={shake}
    style={`transform: rotate(${directions[direction]}deg);`}>
    <path 
        class:no-fire={!fire} 
        class:blast-off={blastOff} 
        d="M42.901,75.068c-0.907,2.177-3.551,2.402-3.821,5.201c-1.681-1.31-1.04-4.039-1.04-4.039c-2.001,2.483-3.805,0.9-5.66,4.326  c-2.86-4.134,1.34-8.795,1.34-8.795s-1.924-0.209-3.376,1.174c-0.668-2.612,2.441-5.408,5.885-5.74  c-3.906-1.242-7.98-0.494-10.384,1.505c-3.624,3.012-2.379,6.868-6.993,10.051c3.493,2.438,7.765-0.257,7.765-0.257  C23.667,83,26.846,87.5,21.318,91.622c9.329,4.022,16.252-7.324,16.252-7.324s1.735,2.644-0.053,6.231  c6.579-0.317,10.206-10.875,5.629-18.049C43.296,73.417,43.21,74.324,42.901,75.068z">
    </path>
    <path d="M76,57.973c-4.328,4.348-8.878,7.678-12.589,10.029c-4.271,2.705-7.998,4.504-10.267,5.5l7.526,20.238  c0.608,1.635,1.712,1.685,2.466,0.111l14.521-30.308c0.491-1.022,0.464-1.812-0.095-2.799L76,57.973z"></path>
    <path d="M89.585,6.647c-0.047-0.521-0.171-1.146-0.551-1.432c-0.38-0.287-1.017-0.235-1.53-0.139  c-2.979,0.562-9.179,1.983-16.148,5.06l17.804,13.429C90.201,16.017,89.863,9.664,89.585,6.647z"></path>
    <path class="rocket" bind:this={rocket} d="M52.342,23.161c-14.65,15.518-16.235,38.026-16.235,38.026l13.648,10.295c0,0,21.206-7.709,32.103-26.06  c3.561-5.996,5.596-12.414,6.724-18.338L68.128,11.658C62.741,14.37,57.129,18.091,52.342,23.161z M75.131,35.369  c0,4.883-3.959,8.842-8.843,8.842s-8.843-3.959-8.843-8.842c0-4.884,3.959-8.842,8.843-8.842S75.131,30.485,75.131,35.369z">
    </path>
    <path d="M35.701,47.101c1.242-4.214,3.193-9.504,6.184-14.86l-3.096-0.743c-1.103-0.264-1.868-0.073-2.717,0.679L10.921,54.466  c-1.305,1.157-0.954,2.204,0.785,2.341l21.527,1.676C33.568,56.027,34.274,51.95,35.701,47.101z"></path>
</svg>
