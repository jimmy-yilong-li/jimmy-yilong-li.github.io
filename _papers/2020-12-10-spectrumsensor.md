---
layout: papers
title: "Enabling Wideband, Mobile Spectrum Sensing through Onboard Heterogeneous Computing"
date: 2021-01-31
image: /images/spectrum.jpg
venue: "HotMobile 2021"
publication_area: "Wireless Sensing"
authors: "<strong>Yilong Li</strong>, Yijing Zeng, Suman Banerjee"
link: https://dl.acm.org/doi/10.1145/3446382.3448651
arxiv: ""
abstract: >
  We explore the design of a platform to support truly mobile and untethered,
  wideband spectrum sensing. First, the design of the platform needs to be
  physically small and lightweight. Next, we observe that wideband spectrum
  sensing (say > 20 MHz at a time) can easily generate a large volume of
  PSD/IQ data, in uncompressed form (> 1 Gbps). Due to challenges of efficient
  offload of this large data volume, we design a heterogeneous computing
  platform — using a combination of FPGA and CPU — built right on the
  spectrum sensor board, onto which various sophisticated compression algorithms,
  or wireless signal processing functions (even deep learning based ones) can
  be implemented. The FPGA is chosen to meet the real-time processing requirements
  of modern high-speed wireless protocols, opening new opportunities. Finally,
  we provide easy connectivity to common mobile devices (currently Android phone)
  and a starting mobile app to enable easy programmability and control functions.
  Overall, our highly-integrated platform has the capability of sensing a wide
  frequency range of wireless signals with a high sampling rate and being controlled
  by a mobile phone via a USB OTG cable. We build a prototype of our system and
  show through experiments that our device can support a bandwidth up to 56 MHz
  and a wide frequency range from 70 MHz to 6 GHz for spectrum sensing, and run
  a deep learning model inference onboard for signal classification. We conclude
  by discussing the future challenges to realize large-scale spectrum sensing
  using our platform.
pdf: /pdfs/spectrum_hotmobile21.pdf
bib: |-
  @inproceedings{10.1145/3446382.3448651,
    author = {Li, Yilong and Zeng, Yijing and Banerjee, Suman},
    title = {Enabling Wideband, Mobile Spectrum Sensing through Onboard Heterogeneous Computing},
    year = {2021},
    isbn = {9781450383233},
    publisher = {Association for Computing Machinery},
    address = {New York, NY, USA},
    url = {https://doi.org/10.1145/3446382.3448651},
    doi = {10.1145/3446382.3448651},
    booktitle = {Proceedings of the 22nd International Workshop on Mobile Computing Systems and Applications},
    pages = {85–91},
    numpages = {7},
    keywords = {Mobile spectrum sensing, Heterogeneous computing},
    location = {Virtual, United Kingdom},
    series = {HotMobile '21}
  }
---
