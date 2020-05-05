function display_projects() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/projects/list");
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        const json_data = xhr.response;
        const projects = json_data["projects"];
        // Form HTML
        var elem_html = '<div class="project">';
        for (var i = 0; i < projects.length; i++) {
            var proj_html = '<div class="project-blurb"><h3 class="project-name">';
            proj_html += projects[i]["name"] + '</h3><p class="project-langs">';
            const langs = projects[i]["langs"];
            if (langs.length > 0) {
                proj_html += langs[0];
                for (var j = 1; j < langs.length; j++) {
                    proj_html += "&bull; " + langs[j];
                }
            }
            elem_html += proj_html + "</p></div>";
        }
        elem_html += "</div>";
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
