FROM homebrew/brew

# INSTALL bun AND typst
RUN brew tap oven-sh/bun
RUN brew install bun
RUN brew install typst


# COPY THE PROJECT
COPY . /app
WORKDIR /app

# OPEN PORT
EXPOSE 3000

# INSTALL DEPENDENCIES
RUN bun install

# RUN THE PROJECT
CMD ["bun", "run", "start"]


# How to run the project
# docker build -t typst-build-server .
# docker run -p 3000:3000 typst-build-server