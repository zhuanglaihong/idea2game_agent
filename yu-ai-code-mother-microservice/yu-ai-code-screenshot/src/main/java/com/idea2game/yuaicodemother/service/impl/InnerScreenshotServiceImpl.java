package com.idea2game.yuaicodemother.service.impl;

import com.idea2game.yuaicodemother.innerservice.InnerScreenshotService;
import com.idea2game.yuaicodemother.service.ScreenshotService;
import jakarta.annotation.Resource;
import org.apache.dubbo.config.annotation.DubboService;

@DubboService
public class InnerScreenshotServiceImpl implements InnerScreenshotService {

    @Resource
    private ScreenshotService screenshotService;

    @Override
    public String generateAndUploadScreenshot(String webUrl) {
        return screenshotService.generateAndUploadScreenshot(webUrl);
    }
}
