---
layout: layout
title: Publications
permalink: /publications/
---

<section class="home-section publications-page">
  <div class="section-heading">
    <p class="section-label">Research Output</p>
    <h1>Publications</h1>
    <p class="section-intro">
      A complete list of publications grouped by current research direction.
    </p>
  </div>

  {% assign posts = site.papers | sort: "date" | reverse %}
  {% assign publication_areas = "On-Device AI|Agentic AI for Small LLMs|Wireless Sensing" | split: "|" %}
  <div class="publication-page-list">
    {% for area in publication_areas %}
    <section class="publication-section-group" aria-labelledby="{{ area | slugify }}">
      <h2 class="publication-section-heading" id="{{ area | slugify }}">{{ area }}</h2>
      <div class="publication-section-list">
        {% for post in posts %}
          {% assign publication_year = post.date | date: "%Y" | plus: 0 %}
          {% if publication_year >= 2016 and post.hidden != true and post.publication_area == area %}
            {% assign post_arxiv = post.arxiv | strip %}
            {% assign post_pdf = post.pdf | strip %}
            {% assign post_video = post.video | strip %}
            {% assign post_code = post.code | strip %}
            {% assign post_poster = post.poster | strip %}
            {% assign post_slides = post.slides | strip %}
            {% assign post_link = post.link | strip %}
            <article class="publication-page-item">
              <h3 class="publication-page-title">
                <a href="{{ post.url }}">{{ post.title }}</a>
              </h3>
              <p class="publication-page-meta">
                {{ post.authors }}<br />
                <strong class="publication-venue">{{ post.venue }}</strong>
                {% if post.note %}
                  <span class="publication-note">{{ post.note }}</span>
                {% endif %}
              </p>
              <p class="publication-page-links">
                {% if post_arxiv != "" %}
                  <a href="{{ post_arxiv }}">arXiv</a>
                {% endif %}
                {% if post_pdf != "" %}
                  <a href="{{ post_pdf }}">PDF</a>
                {% endif %}
                {% if post_video != "" %}
                  <a href="{{ post_video }}">Video</a>
                {% endif %}
                {% if post_code != "" %}
                  <a href="{{ post_code }}">Code</a>
                {% endif %}
                {% if post_poster != "" %}
                  <a href="{{ post_poster }}">Poster</a>
                {% endif %}
                {% if post_slides != "" %}
                  <a href="{{ post_slides }}">Slides</a>
                {% endif %}
                {% if post_link != "" and post_link != post_arxiv and post_link != post_pdf %}
                  <a href="{{ post_link }}">Link</a>
                {% endif %}
                <a href="{{ post.url }}">Details</a>
              </p>
            </article>
          {% endif %}
        {% endfor %}
      </div>
    </section>
    {% endfor %}
  </div>
</section>
