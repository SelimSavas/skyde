package com.yagmurvarmi.yagmurvarmi

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import io.flutter.embedding.android.FlutterActivity

class MainActivity : FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        // Flutter SystemUiMode.edgeToEdge ile aynı: native splash → Flutter arasında
        // “önce letterbox, sonra tam ekran” sıçramasını önler.
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
        }
        if (Build.VERSION.SDK_INT >= 35) {
            window.isStatusBarContrastEnforced = false
        }
        // Bazı arayüzler Activity başlığını üstte gösterir; uygulama adı şeridini kapatır.
        title = ""
    }
}
