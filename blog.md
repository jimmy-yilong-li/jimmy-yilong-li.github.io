---
layout: layout
title: Blog
permalink: /blog/
---

<section class="home-section blog-page">
  <div class="section-heading">
    <p class="section-label">Research Notes</p>
    <h1>Blog</h1>
    <p class="section-intro">
      Work in progress, prototypes, and research notes that describe ongoing
      systems work before it becomes a formal publication.
    </p>
  </div>

  {% assign notes = site.posts | sort: "date" | reverse %}
  <div class="blog-list">
    {% for note in notes %}
      <article class="blog-item">
        <div class="blog-item-header">
          <p class="blog-date">{{ note.date | date: "%Y.%m.%d" }}</p>
          {% if note.status %}
            <span class="blog-status">{{ note.status }}</span>
          {% endif %}
          {% if note.theme %}
            <span class="blog-theme">{{ note.theme }}</span>
          {% endif %}
        </div>
        <h2 class="blog-title">
          <a href="{{ note.url }}">{{ note.title }}</a>
        </h2>
        {% if note.summary %}
          <p class="blog-summary">{{ note.summary }}</p>
        {% endif %}
        <a class="text-link" href="{{ note.url }}">Read note</a>
      </article>
    {% endfor %}
  </div>
</section>
