// API server for my website
// (C) 2020 Srimanta Barua <srimanta.barua1@gmail.com>

use std::env;
use std::fs;
use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};

use serde::{Deserialize};

mod threadpool;
use threadpool::ThreadPool;

#[derive(Deserialize)]
struct Project {
    name: String,
    langs: Vec<String>,
    path: String,
}

#[derive(Deserialize)]
struct Projects {
    projects: Vec<Project>,
}

fn send_response(mut stream: TcpStream, resp: &str) {
    if stream.write(resp.as_bytes()).is_ok() {
        let _ = stream.flush();
    }
}

fn send_404(stream: TcpStream) {
    let resp = format!("HTTP/1.1 404 Not Found\r\n\r\n{}", include_str!("404.html"));
    send_response(stream, &resp);
}

fn send_file(stream: TcpStream, path: &str, typ: &str) {
    if let Ok(data) = fs::read_to_string(path) {
        let resp = format!("HTTP/1.1 200 OK\r\nContent-Type: {}\r\n\r\n{}", typ, data);
        send_response(stream, &resp);
    } else {
        send_404(stream);
    }
}

fn send_project_html(stream: TcpStream, mut proj_root: String, proj_name: &str) {
    let proj_json_path = proj_root.clone() + "/projects.json";
    if let Ok(raw_proj_json) = fs::read_to_string(proj_json_path) {
        let projects: Projects = serde_json::from_str(&raw_proj_json).unwrap();
        for project in &projects.projects {
            if project.name == proj_name {
                proj_root += &project.path;
                return send_file(stream, &proj_root, "text/html");
            }
        }
    }
    send_404(stream);
}

fn handle_connection(mut stream: TcpStream, mut proj_root: String, mut blog_root: String) {
    let mut headers = [httparse::EMPTY_HEADER; 16];
    let mut req = httparse::Request::new(&mut headers);
    let mut buf = [0; 512];
    let len = stream.read(&mut buf).unwrap();
    let res = req.parse(&buf[..len]);
    if !res.is_ok() || !res.unwrap().is_complete() {
        return send_404(stream);
    }
    match req.method {
        Some("GET") => {
            let path = req.path.unwrap_or("");
            println!("Req path: {}", path);
            let mut components = path.split("/").filter(|s| s.len() > 0);
            match components.next() {
                Some("api") => match components.next() {
                    Some("project") => match components.next() {
                        Some(proj_name) => return send_project_html(stream, proj_root, proj_name),
                        _ => return send_404(stream),
                    },
                    Some("projects") => match components.next() {
                        Some("list") => {
                            proj_root += "/projects.json";
                            send_file(stream, &proj_root, "application/json");
                        }
                        _ => return send_404(stream),
                    },
                    _ => return send_404(stream),
                },
                _ => return send_404(stream),
            }
        }
        _ => return send_404(stream),
    }
}

fn main() {
    let args = env::args().collect::<Vec<_>>();
    if args.len() != 3 {
        println!("USAGE: {} <path/to/projects> <path/to/blog>", args[0]);
        return;
    }
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    {
        let mut pool = ThreadPool::new(8);
        for stream in listener.incoming() {
            let proj_root = args[1].clone();
            let blog_root = args[2].clone();
            if let Ok(stream) = stream {
                pool.run(move || {
                    handle_connection(stream, proj_root, blog_root);
                })
            }
        }
    }
}
