package org.example.emt_project.web.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.emt_project.helpers.JwtHelper;
import org.example.emt_project.service.domain.UserService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.example.emt_project.model.domain.User;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtHelper jwtHelper;
    private final UserService userService;
    private final HandlerExceptionResolver handlerExceptionResolver;

    public JwtFilter(JwtHelper jwtHelper, UserService userService,
                     @Qualifier("handlerExceptionResolver") HandlerExceptionResolver handlerExceptionResolver) {
        this.jwtHelper = jwtHelper;
        this.userService = userService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String headerValue = request.getHeader("Authorization");
        System.out.println("🔍 Header: " + headerValue);

        if (headerValue == null || !headerValue.startsWith("Bearer ")) {
            System.out.println("🚫 No Bearer token found, continuing without auth...");
            filterChain.doFilter(request, response);
            return;
        }

        String token = headerValue.substring(7);
        try {
            String username = jwtHelper.extractUsername(token);
            System.out.println("✅ Extracted username: " + username);
            User user = userService.findByUsername(username).get();
            Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
            if (username != null &&
                    (currentAuth == null ||
                            currentAuth instanceof AnonymousAuthenticationToken)) {

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                System.out.println("✅ Authentication set for user: " + username);
            } else {
                System.out.println("⚠️ Skipping setting auth (current: " +
                        (currentAuth != null ? currentAuth.getClass().getSimpleName() : "null") + ")");
            }
        } catch (Exception e) {
            System.out.println("💥 Exception in filter: " + e.getMessage());
            handlerExceptionResolver.resolveException(request, response, null, e);
            return;
        }

        filterChain.doFilter(request, response);
    }



//    @Override
//    protected void doFilterInternal(
//            @NonNull HttpServletRequest request,
//            @NonNull HttpServletResponse response,
//            @NonNull FilterChain filterChain
//    ) throws ServletException, IOException {
//        String headerValue = request.getHeader(JwtConstants.HEADER);
//        if (headerValue == null || !headerValue.startsWith(JwtConstants.TOKEN_PREFIX)) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = headerValue.substring(JwtConstants.TOKEN_PREFIX.length());
//
//        try {
//            String username = jwtHelper.extractUsername(token);
//            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//            if (username == null || authentication != null) {
//                filterChain.doFilter(request, response);
//                return;
//            }
//
//            User user = userService.findByUsername(username).get();
//            if (jwtHelper.isValid(token, user)) {
//                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                        user,
//                        null,
//                        user.getAuthorities()
//                );
//                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                SecurityContextHolder.getContext().setAuthentication(authToken);
//            }
//        } catch (JwtException jwtException) {
//            handlerExceptionResolver.resolveException(
//                    request,
//                    response,
//                    null,
//                    jwtException
//            );
//            return;
//        }
//
//        filterChain.doFilter(request, response);
//    }

}

