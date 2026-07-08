# MyLife Portfolio: Backend Integration Guide

This frontend is officially 100% complete and ready to be plugged into your Spring Boot Application!

## 1. Setting up Spring Boot CORS
Since the frontend runs on a separate port or domain during development (e.g. VS Code Live Server on Port 5500), your Spring Boot backend (Port 8080) **must** allow Cross-Origin Resource Sharing.

Add this configuration class to your Spring Boot project:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*") // Change this to your frontend URL in production
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
```

## 2. Setting the API Base URL
Open the file `mylife_portfolio_frontend/config/api-config.js`.
Verify the `API_BASE_URL` matches your running Spring Boot server address (usually `http://localhost:8080/api`).

## 3. How the Authentication Works
1. The user logs in via `auth/login.html`.
2. The logic in `js/core/auth.js` posts to `/api/auth/login`.
3. If successful, the script stores the JWT Token using `localStorage.setItem('jwt_token', token)`.
4. From that point forward, **every** request made using the `api.get()` or `api.post()` methods inside `js/core/api.js` will automatically attach the following header:
   `Authorization: Bearer <your_jwt_token>`

## 4. Connecting the Pages (Uncommenting API Calls)
Every single page (`education.js`, `skills.js`, `dashboard.js`, `settings.js`, etc.) has the API logic already written for you. 

To activate the real database connection:
1. Open the respective `.js` file (e.g., `js/pages/skills.js`).
2. Search for `// UNCOMMENT FOR PRODUCTION` or `// api.post(...)`.
3. Remove the `//` slashes to enable the `api.get()`, `api.post()`, `api.put()`, or `api.delete()` functions.
4. Replace the mock `setTimeout` alerts with your real backend responses!

## 5. Handling File Uploads (Certificates & Gallery)
File uploads require `multipart/form-data`. 
In `js/pages/certificates.js` and `js/pages/gallery.js`, we use `FormData` objects. 
Ensure your Spring Boot controller handles this using:
`@RequestParam("file") MultipartFile file`
