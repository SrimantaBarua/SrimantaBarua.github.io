// API server for my website
// (C) 2020 Srimanta Barua <srimanta.barua1@gmail.com>

use std::env;
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
