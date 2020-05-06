const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


// Sliding functions from https://w3bits.com/javascript-slidetoggle/


const DURATION = 500;


function slide_up(elem) {
    elem.style.transitionProperty = "height, margin, padding";
    elem.style.transitionDuration = DURATION + "ms";
    elem.style.boxSizing = "border-box";
    elem.style.height = elem.offsetHeight + "px";
    elem.style.height = 0;
    elem.style.paddingTop = 0;
    elem.style.paddingBottom = 0;
    elem.style.marginTop = 0;
    elem.style.marginBottom = 0;
    elem.style.overflow = "hidden";
    window.setTimeout(function() {
        elem.style.display = "none";
        elem.style.removeProperty("height");
        elem.style.removeProperty("padding-top");
        elem.style.removeProperty("padding-bottom");
        elem.style.removeProperty("margin-top");
        elem.style.removeProperty("margin-bottom");
        elem.style.removeProperty("overflow");
        elem.style.removeProperty("transition-duration");
        elem.style.removeProperty("transition-property");
    }, DURATION);
}


function slide_down(elem) {
    elem.style.removeProperty("display");
    let display = window.getComputedStyle(elem).display;
    if (display == "none") {
        display = "block";
    }
    elem.style.display = display;
    let height = elem.offsetHeight;
    elem.style.height = 0;
    elem.style.paddingTop = 0;
    elem.style.paddingBottom = 0;
    elem.style.marginTop = 0;
    elem.style.marginBottom = 0;
    elem.style.overflow = "hidden";
    elem.style.boxSizing = "border-box";
    elem.style.transitionProperty = "height, margin, padding";
    elem.style.transitionDuration = DURATION + "ms";
    elem.style.height = height + "px";
    elem.style.removeProperty("padding-top");
    elem.style.removeProperty("padding-bottom");
    elem.style.removeProperty("margin-top");
    elem.style.removeProperty("margin-bottom");
    window.setTimeout(function() {
        elem.style.removeProperty("height");
        elem.style.removeProperty("overflow");
        elem.style.removeProperty("transition-duration");
        elem.style.removeProperty("transition-property");
    }, DURATION);
}


function slide_toggle(elem) {
    if (window.getComputedStyle(elem).display == "none") {
        return slide_down(elem);
    } else {
        return slide_up(elem);
    }
}


function load_blog(elem, blog_key) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/blog/" + blog_key);
    xhr.responseType = "text";
    xhr.send();
    xhr.onload = function() {
        var node = document.createElement("div");
        node.classList.add("blog-text");
        node.innerHTML = xhr.response;
        elem.appendChild(node);
        Prism.highlightAllUnder(elem);
    }
}


function blog_show_toggle(blog_id, blog_key) {
    var elem = document.getElementById(blog_id);
    if (elem.childElementCount < 2) {
        load_blog(elem, blog_key);
    } else {
        slide_toggle(elem.children[1]);
    }
}


function display_blogs() {
    var place_to_insert = document.getElementById("content-blog");
    if (place_to_insert.childElementCount > 0) {
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/blogs/list");
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        const json_data = xhr.response;
        const blogs = json_data.blogs;
        // Form HTML
        var elem_html = '';
        for (var i = 0; i < blogs.length; i++) {
            var date = new Date(blogs[i].date);
            var datefmt = MONTHS[date.getMonth()] + " " + date.getDate().toString();
            datefmt += ", " + date.getFullYear().toString();
            const blog_id = 'blog-num-' + i.toString();
            const fncall = "load_blog('" + blog_id + "','" + blogs[i].key.toString() + "')"
            elem_html += '<div class="blog" id="' + blog_id + '">'
            elem_html += '<div class="blog-blurb"><h3 class="blog-title">'
            elem_html += '<a href="#" onClick="' + fncall + '">';
            elem_html += blogs[i].title + '</a></h3><p class="blog-date">';
            elem_html += datefmt + "</p></div></div>";
        }
        // Insert into DOM
        place_to_insert.innerHTML = elem_html;
    }
}


function load_project(proj_id, proj_name) {
    var elem = document.getElementById(proj_id);
    if (elem.childElementCount >= 2) {
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/project/" + proj_name);
    xhr.responseType = "text";
    xhr.send();
    xhr.onload = function() {
        var node = document.createElement("div");
        node.classList.add("project-description");
        node.innerHTML = xhr.response;
        elem.appendChild(node);
    }
}


function display_projects() {
    var place_to_insert = document.getElementById("content-projects");
    if (place_to_insert.childElementCount > 0) {
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/projects/list");
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        const json_data = xhr.response;
        const projects = json_data.projects;
        // Form HTML
        var elem_html = '';
        for (var i = 0; i < projects.length; i++) {
            const proj_id = 'project-num-' + i.toString();
            const proj_name = projects[i].name.replace('\'', '\\\'').replace('"', '&quot;');
            const fncall = "load_project('" + proj_id + "','" + proj_name + "')"
            elem_html += '<div class="project" id="' + proj_id + '">'
            elem_html += '<div class="project-blurb"><h3 class="project-name">'
            elem_html += '<a href="#" onClick="' + fncall + '">';
            elem_html += projects[i].name + '</a></h3><p class="project-langs">';
            const langs = projects[i].langs;
            if (langs.length > 0) {
                elem_html += langs[0];
                for (var j = 1; j < langs.length; j++) {
                    elem_html += " &bull; " + langs[j];
                }
            }
            elem_html += "</p></div></div>";
        }
        // Insert into DOM
        place_to_insert.innerHTML = elem_html;
    }
}


function navbar_click(page_name) {
    var target_id = 'content-' + page_name;
    var content = document.getElementById("content");
    for (var child = content.firstElementChild; child != null; child = child.nextElementSibling) {
        if (child.id == target_id) {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }
    }
    if (page_name == "projects") {
        display_projects();
    } else if (page_name == "blog") {
        display_blogs();
    }
}
