# Como criar um novo post no blog

## 1. Arquivo markdown

Crie um arquivo `.md` em `posts/` com o título como nome do arquivo:

```
posts/My Post Title Here.md
```

O título exibido no blog é o próprio nome do arquivo (sem `.md`). O slug da URL é gerado automaticamente via slugify (lowercase, caracteres não-alfanuméricos viram `-`).

**Exemplo:** `posts/When Dependency Injection Goes Too Far.md` → URL `/blog/when-dependency-injection-goes-too-far`

## 2. Frontmatter

```yaml
---
published-at: '2025-06-09T12:14:26.000+00:00'
summary: >-
  Uma ou duas frases descrevendo o post. Aparece na listagem do blog.
og-image: /blog-images/slug-do-post.png
linkedin-url: >-
  https://www.linkedin.com/pulse/...
social-post: "Texto para postar no LinkedIn (opcional)"
---
```

Campos obrigatórios: `published-at`, `summary`.  
Campos opcionais mas recomendados: `og-image`, `linkedin-url`.

## 3. Imagem OG

- Coloque a imagem em `public/blog-images/`
- Nomeie com o mesmo slug da URL: `slug-do-post.png`
- Referencie no frontmatter como `/blog-images/slug-do-post.png`

**Exemplo de slug:** título `When Dependency Injection Goes Too Far` → `when-dependency-injection-goes-too-far.png`

## 4. Conteúdo

O corpo do arquivo é Markdown padrão. Links internos do LinkedIn para outros posts do blog são reescritos automaticamente para rotas locais `/blog/{slug}` — desde que o post de destino tenha `linkedin-url` no frontmatter.
