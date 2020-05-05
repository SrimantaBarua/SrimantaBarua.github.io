function load_project(proj_id, proj_name) {
    //var xhr = new XMLHttpRequest();
    //xhr.open("GET", "api/project/" + proj_name);
    var elem = documents.getElementById(proj_id);
    elem.innerHTML = "<div class='project-description'><p>Empty description</p></div>";
}


function display_projects() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/projects/list");
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        const json_data = xhr.response;
        const projects = json_data["projects"];
        // Form HTML
        var elem_html = '';
        for (var i = 0; i < projects.length; i++) {
            const proj_id = 'project-num-' + i.toString();
            const proj_name = projects[i].name;
            const fncall = "load_project('" + proj_id + "','" + proj_name + "')"
            elem_html += '<div class="project" id="' + proj_id + '">'
            elem_html += '<div class="project-blurb"><h3 class="project-name">'
            elem_html += '<a href="#" onClick="' + fncall + '">';
            elem_html += projects[i]["name"] + '</a></h3><p class="project-langs">';
            const langs = projects[i]["langs"];
            if (langs.length > 0) {
                elem_html += langs[0];
                for (var j = 1; j < langs.length; j++) {
                    elem_html += " &bull; " + langs[j];
                }
            }
            elem_html += "</p></div></div>";
        }
        // Insert into DOM
        var place_to_insert = document.getElementById("content-projects");
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
    }
}
