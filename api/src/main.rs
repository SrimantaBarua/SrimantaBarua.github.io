// API server for my website
// (C) 2020 Srimanta Barua <srimanta.barua1@gmail.com>

use std::fs;
use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};

mod threadpool;
use threadpool::ThreadPool;

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
    let data = fs::read_to_string(path).unwrap();
    let resp = format!("HTTP/1.1 200 OK\r\nContent-Type: {}\r\n\r\n{}", typ, data);
    send_response(stream, &resp);
}

fn handle_connection(mut stream: TcpStream, proj_root: &str, blog_root: &str) {
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
                    Some("projects") => match components.next() {
                        Some("list") => {
                            let path = proj_root.to_owned() + "/projects.json";
                            send_file(stream, &path, "application/json");
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

static PROJ_ROOT: &str = "/home/barua/Documents/website/projects";
static BLOG_ROOT: &str = "/home/barua/Documents/website/blog";

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    {
        let mut pool = ThreadPool::new(8);
        for stream in listener.incoming() {
            if let Ok(stream) = stream {
                pool.run(|| {
                    handle_connection(stream, PROJ_ROOT, BLOG_ROOT);
                })
            }
        }
    }
}
