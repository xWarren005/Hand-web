// ════════════════════════════════════════════════════════════════
//  Cấu hình Tailwind - Trang Hướng Dẫn Sử Dụng (HDSD)
//  Định nghĩa bảng màu, khoảng cách, font chữ dùng chung với hệ thống
// ════════════════════════════════════════════════════════════════
try {
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                "colors": {
                    "outline": "#869585",
                    "tertiary-fixed-dim": "#f7be1d",
                    "on-secondary-fixed-variant": "#930013",
                    "inverse-surface": "#dae2fd",
                    "error": "#ffb4ab",
                    "secondary-fixed-dim": "#ffb3ad",
                    "on-primary-fixed": "#002109",
                    "on-background": "#dae2fd",
                    "surface": "#0b1326",
                    "outline-variant": "#3d4a3d",
                    "on-primary-fixed-variant": "#005321",
                    "tertiary-container": "#d7a400",
                    "secondary": "#ffb3ad",
                    "on-surface": "#dae2fd",
                    "on-error-container": "#ffdad6",
                    "tertiary-fixed": "#ffdf9a",
                    "on-secondary-container": "#ffaea8",
                    "inverse-on-surface": "#283044",
                    "surface-tint": "#4ae176",
                    "on-primary-container": "#004b1e",
                    "on-secondary": "#68000a",
                    "secondary-fixed": "#ffdad7",
                    "on-tertiary-fixed": "#251a00",
                    "on-secondary-fixed": "#410004",
                    "surface-dim": "#0b1326",
                    "on-tertiary": "#3f2e00",
                    "on-tertiary-fixed-variant": "#5a4300",
                    "on-surface-variant": "#bccbb9",
                    "on-primary": "#003915",
                    "surface-bright": "#31394d",
                    "background": "#0b1326",
                    "primary": "#4be277",
                    "on-tertiary-container": "#523d00",
                    "surface-variant": "#2d3449",
                    "on-error": "#690005",
                    "surface-container-highest": "#2d3449",
                    "surface-container-lowest": "#060e20",
                    "secondary-container": "#a40217",
                    "primary-fixed-dim": "#4ae176",
                    "primary-fixed": "#6bff8f",
                    "tertiary": "#f7bf1e",
                    "surface-container-high": "#222a3d",
                    "surface-container": "#171f33",
                    "primary-container": "#22c55e",
                    "inverse-primary": "#006e2f",
                    "surface-container-low": "#131b2e",
                    "error-container": "#93000a"
                },
                "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
                },
                "spacing": {
                    "stack-sm": "8px",
                    "stack-lg": "32px",
                    "margin-page": "32px",
                    "gutter": "24px",
                    "stack-md": "16px",
                    "panel-padding": "24px",
                    "container-max": "1440px"
                },
                "fontFamily": {
                    "headline-md": ["Inter"],
                    "body-lg": ["Inter"],
                    "label-md": ["Inter"],
                    "headline-lg": ["Inter"],
                    "headline-xl": ["Inter"],
                    "label-sm": ["Inter"],
                    "body-md": ["Inter"]
                },
                "fontSize": {
                    "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                    "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                    "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500" }],
                    "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
                    "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                    "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
                    "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
                }
            }
        }
    }
} catch (_e) { }