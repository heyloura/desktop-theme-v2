function openTerminal() {
  if($("#dialog").hasClass("ui-dialog-content") && !$( '#dialog' ).dialog( 'isOpen' ))
  {
    $( '#dialog' ).dialog( 'open' );
  } 
  else  if(!$("#dialog").hasClass("ui-dialog-content"))
  {
            if($(window).width() <= 600) {
                $( "#dialog" ).dialog({ height: $(window).height() - 10, width: $(window).width() - 20 });
            } else {
                $( "#dialog" ).dialog({ height: $(window).height()/1.5, width: $(window).width()/1.5, minWidth: 600, minHeight: 600  });
            }
  }
} 

$( function() {

            if(location.pathname != "/") {
                 $( "#dialog" ).hide();
            } else {

                if($(window).width() <= 600) {
                    $( "#dialog" ).dialog({ height: $(window).height() - 10, width: $(window).width() - 20 });
                } else {
                    $( "#dialog" ).dialog({ height: $(window).height()/1.25, width: $(window).width()/1.5, minWidth: 600, minHeight: 600  });
                }

            }


            const font = 'Slant';

            figlet.defaults({ fontPath: 'https://unpkg.com/figlet/fonts/' });
            figlet.preloadFonts([font], ready);

            const formatter = new Intl.ListFormat('en', {
                style: 'long',
                type: 'conjunction',
            });

            const directories = {
                archive: [],
                bookmarks: [],
                websites: [],
                projects: [
                    '',
                    '<white>Open Source projects</white>',
                    [
                        ['jQuery Terminal',
                        'https://terminal.jcubic.pl',
                        'library that adds terminal interface to websites'
                        ],
                        ['LIPS Scheme','https://lips.js.org', 'Scheme implementation in JavaScript'],
                        ['Sysend.js','https://jcu.bi/sysend', 'Communication between open tabs'],
                        ['Wayne','https://jcu.bi/wayne', 'Pure in browser HTTP requests'],
                    ].map(([name, url, description = '']) => {
                        return `* <a href="${url}">${name}</a> — <white>${description}</white>`;
                    }),
                    ''
                ].flat(),
                skills: [
                    '',
                    '<white>languages</white>',

                    [
                        'JavaScript',
                        'TypeScript',
                        'Python',
                        'SQL',
                        'PHP',
                        'Bash'
                    ].map(lang => `* <yellow>${lang}</yellow>`),
                    '',
                    '<white>libraries</white>',
                    [
                        'React.js',
                        'Redux',
                        'Jest',
                    ].map(lib => `* <green>${lib}</green>`),
                    '',
                    '<white>tools</white>',
                    [
                        'Docker',
                        'git',
                        'GNU/Linux'
                    ].map(lib => `* <blue>${lib}</blue>`),
                    ''
                ].flat()
            };

            const dirs = Object.keys(directories);

            const root = '~';
            let cwd = root;

            const user = 'guest';
            const server = 'heyloura.com';

            function prompt() {
                return `<green>${user}@${server}</green>:<SkyBlue>${cwd}</SkyBlue>$ `;
            }

            function print_dirs() {
                term.echo('[[ub;white;]Date Modified]');
                term.echo(dirs.map(dir => {
                    return `\t<SkyBlue class="directory">${dir}</SkyBlue>`;
                }).join('\n'));
            }

            const commands = {
                help() {
                    var message = [
                        '',
                        'Commands are case-sensitive',
                        '',
                        ' cd\t\t\tMove inside a folder. Needs name or ..',
                        ' <white class="command">clear</white>\t\tClears the screen',
                        ' <white class="command">credits</white>\tDisplays credits',
                        ' <white class="command">help</white>\t\tDisplay this menu',
                        ' <white class="command">ls</white>\t\t\tDisplays files and folders',
' <white class="command">open</white>\t\tOpens a file',
                        ''
                    ].join('\n');

                    term.echo(message, { keepWords: true });
                },
                ls(dir = null) {
                    if (dir) {
                        if (dir.startsWith('~/')) {
                            const path = dir.substring(2);
                            const dirs = path.split('/');
                            if (dirs.length > 1) {
                                this.error('Invalid directory');
                            } else {
                                const dir = dirs[0];
                                this.echo(directories[dir].join('\n'));
                            }
                        } else if (cwd === root) {
                            if (dir in directories) {
                                this.echo(directories[dir].join('\n'));
                            } else {
                                this.error('Invalid directory');
                            }
                        } else if (dir === '..') {
                            print_dirs();
                        } else {
                            this.error('Invalid directory');
                        }
                    } else if (cwd === root) {
                        print_dirs();
                    } else {
                        const dir = cwd.substring(2);
                        if(dir == "archive") {
                            var blog = $('#posts option').map(function() {
                                    let categories = $(this).data('category') ? $(this).data('category').split(',').map(function(cat) { return cat ? `<orange>#${cat.trim().toLowerCase().replace(' ','-')}</orange>` : ''}).join(' ') : '';
                                    return `<white>${$(this).data('title') ? `<b>${$(this).data('title').trim()}</b>` : $(this).data('content').replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '').trim()}</white>\n<grey>${$(this).data('date')}</grey> <a href="${$(this).data('permalink')}">${$(this).data('permalink').split('/').pop()}</a> ${categories}\n`;
                                })
                                .get()
                                .join('\n');
                            this.echo(blog, { keepWords: true });
                        } else {
                            this.echo(directories[dir].join('\n'));
                        }
                    }
                },
                async joke() {
                    // we use programming jokes so it fit better developer portfolio
                    const res = await fetch('https://v2.jokeapi.dev/joke/Programming');
                    const data = await res.json();
                    (async () => {
                        if (data.type == 'twopart') {
                            // we set clear the prompt to don't have any
                            // flashing between animations
                            const prompt = this.get_prompt();
                            this.set_prompt('');
                            // as said before in every function, passed directly
                            // to terminal, you can use `this` object
                            // to reference terminal instance
                            await this.echo(`Q: ${data.setup}`, {
                                delay: 50,
                                typing: true
                            });
                            await this.echo(`A: ${data.delivery}`, {
                                delay: 50,
                                typing: true
                            });
                            // we restore the prompt
                            this.set_prompt(prompt);
                        } else if (data.type === 'single') {
                            await this.echo(data.joke, {
                                delay: 50,
                                typing: true
                            });
                        }
                    })();
                },
                cd(dir = null) {
                    if (dir === null || (dir === '..' && cwd !== root)) {
                        cwd = root;
                    } else if (dir.startsWith('~/') && dirs.includes(dir.substring(2))) {
                        cwd = dir;
                    } else if (dirs.includes(dir)) {
                        cwd = root + '/' + dir;
                    } else {
                        this.error('Wrong directory');
                    }
                },
                credits() {
                    // you can return string or a Promise from a command
                    return [
                        '',
                        '<white>Used libraries:</white>',
                        '* <a href="https://terminal.jcubic.pl">jQuery Terminal</a>',
                        '* <a href="https://github.com/patorjk/figlet.js/">Figlet.js</a>',
                        '* <a href="https://github.com/jcubic/isomorphic-lolcat">Isomorphic Lolcat</a>',
                        '* <a href="https://jokeapi.dev/">Joke API</a>',
                       '* <a target="_blank" href="https://codepen.io/swards/pen/gxQmbj">Chat bubble CSS</a>',
                        ''
                    ].join('\n');
                },
                echo(...args) {
                    if (args.length > 0) {
                        term.echo(args.join(' '));
                    }
                },
                welcome() {
                    var message = [
                        '',
                        `This website was built to be fun! Instead of drab, this one is fab! Close this terminal and check out what's on my desktop. You'll find my photos, website pages, what I'm reading, and anything else I'm in the mood to share. Have a fantastic day!`,
                        '',
                        '<white>Terminal Instructions:</white>',
                        '* Type (or click) <white class="command">help</white> for available commands',
                        ''
                    ].join('\n');

                    term.echo(message, { keepWords: true });
                },
                open(blog = null) {
                    if (blog === null) {
                        this.error('No file specified.');
                    } 

                    var blog;
                    
                    if (cwd.startsWith('~/archive')) {
                      blog = $('#posts option').filter(function() {
                          if($(this).data('permalink').split('/').pop() == blog) {
                              return $(this).data('permalink');
                          }
                      });
                    } 

                    if (!blog[0]) {
                        this.error('Could not find file.');
                    } 

                    window.location.href = $(blog[0]).data('permalink');
                }
            };

            // clear is default command that you can turn off with an option
            const command_list = ['clear'].concat(Object.keys(commands));
            const formatted_list = command_list.map(cmd => `<white class="command">${cmd}</white>`);
            const help = formatter.format(formatted_list);

            const re = new RegExp(`^\s*(${command_list.join('|')})(\s?.*)`);

            $.terminal.new_formatter([re, function(_, command, args) {
                return `<white class="command">${command}</white><aquamarine>${args}</aquamarine>`;
            }]);

            $.terminal.xml_formatter.tags.blue = (attrs) => {
                return `[[;#55F;;${attrs.class}]`;
            };
            $.terminal.xml_formatter.tags.green = (attrs) => {
                return `[[;#44D544;]`;
            };

            const term = $('#content').terminal(commands, {
                greetings: false,
                checkArity: false,
                 completion(string) {
                    // in every function we can use this to reference term object
                    const { name, rest } = $.terminal.parse_command(this.get_command());
                    if (['cd', 'ls'].includes(name)) {
                        if (rest.startsWith('~/')) {
                            return dirs.map(dir => `~/${dir}`);
                        }
                        if (cwd === root) {
                            return dirs;
                        }
                    }
                    if (['open'].includes(name)) {
                        if (cwd.startsWith('~/archive')) {
                            return $('#posts option').map(function() {
                                 return $(this).data('permalink').split('/').pop()
                                });
                        }
                    }
                    return Object.keys(commands);
                },
                prompt
            });

            term.pause();

            term.on('click', '.command', function() {
                const command = $(this).text();
                term.exec(command, { typing: true, delay: 50 });
            });

            term.on('click', '.directory', function() {
                const dir = $(this).text();
                term.exec(`cd ~/${dir}`, { typing: true, delay: 50 });
            });

            function ready() {
                const seed = rand(256);

                  if($(window).width() <= 500) {
                      term.echo(() => rainbow('Hey Loura!', seed))
                      .resume();
                    } else {
                      term.echo(() => rainbow(render('Hey Loura!'), seed))
                      .resume();
                    }

                if(location.pathname == "/archive")
                {
                   cwd = '~/archive';
                   term.exec(`ls`, { typing: true, delay: 50 });
                } else {
                    term.exec('welcome', { typing: true, delay: 50 });
               }

            }

            function rainbow(string, seed) {
                return lolcat.rainbow(function(char, color) {
                    char = $.terminal.escape_brackets(char);
                    return `[[;${hex(color)};]${char}]`;
                }, string, seed).join('\n');
            }

            function rand(max) {
                return Math.floor(Math.random() * (max + 1));
            }

            function render(text) {
                const cols = term.cols();
                return trim(figlet.textSync(text, {
                    font: font,
                    width: cols,
                    whitespaceBreak: true
                }));
            }

            function trim(str) {
                return str.replace(/[\n\s]+$/, '');
            }

            function hex(color) {
                return '#' + [color.red, color.green, color.blue].map(n => {
                    return n.toString(16).padStart(2, '0');
                }).join('');
            }


        } );
