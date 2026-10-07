package com.idea2game.yuaicodemother.controller;

import com.idea2game.yuaicodemother.constant.AppConstant;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

/** 生成预览与已发布游戏的匿名静态资源入口。 */
@RestController
@RequestMapping({"/static", "/published"})
public class StaticResourceController {
    @GetMapping("/{deployKey}/**")
    public ResponseEntity<Resource> serveStaticResource(@PathVariable String deployKey, HttpServletRequest request) {
        try {
            if (!deployKey.matches("[a-zA-Z0-9_-]+")) return ResponseEntity.badRequest().build();
            String handlerPath = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
            boolean published = handlerPath.startsWith("/published/");
            String prefix = (published ? "/published/" : "/static/") + deployKey;
            String resourcePath = handlerPath.substring(prefix.length());
            if (resourcePath.isEmpty()) {
                return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                        .header(HttpHeaders.LOCATION, request.getRequestURI() + "/").build();
            }
            if (resourcePath.equals("/")) resourcePath = "/index.html";
            Path root = Path.of(published ? AppConstant.CODE_DEPLOY_ROOT_DIR : AppConstant.CODE_OUTPUT_ROOT_DIR).toRealPath();
            Path gameDir = root.resolve(deployKey).normalize();
            Path file = gameDir.resolve(resourcePath.substring(1)).normalize();
            // 同时阻止相对路径越界和符号链接越界。
            if (!gameDir.startsWith(root) || !file.startsWith(gameDir) || !Files.isRegularFile(file)) {
                return ResponseEntity.notFound().build();
            }
            Path realGameDir = gameDir.toRealPath();
            Path realFile = file.toRealPath();
            if (!realGameDir.startsWith(root) || !realFile.startsWith(realGameDir)) return ResponseEntity.notFound().build();
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, contentType(realFile))
                    .header("X-Content-Type-Options", "nosniff")
                    .body(new FileSystemResource(realFile));
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String contentType(Path path) throws IOException {
        String name = path.getFileName().toString().toLowerCase(Locale.ROOT);
        if (name.endsWith(".html")) return "text/html; charset=UTF-8";
        if (name.endsWith(".css")) return "text/css; charset=UTF-8";
        if (name.endsWith(".js") || name.endsWith(".mjs")) return "application/javascript; charset=UTF-8";
        if (name.endsWith(".json") || name.endsWith(".gltf")) return "application/json; charset=UTF-8";
        if (name.endsWith(".glb")) return "model/gltf-binary";
        if (name.endsWith(".wasm")) return "application/wasm";
        if (name.endsWith(".svg")) return "image/svg+xml";
        String detected = Files.probeContentType(path);
        return detected == null ? "application/octet-stream" : detected;
    }
}
