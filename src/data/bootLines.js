/**
 * Boot log lines with pools for randomization.
 * Use buildBootLines(siteName) to get a shuffled/resolved line array.
 */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const POOL_CLOCKSOURCE = [
  { text: '[    0.000523] clocksource: hpet: mask: 0xffffffff max_cycles: 0xffffffff', type: 'info', instant: true },
  { text: '[    0.000523] clocksource: tsc: mask: 0xffffffffffff max_cycles: 0xffffffffffff', type: 'info', instant: true },
  { text: '[    0.000523] clocksource: jiffies: mask: 0xffffffff max_cycles: 0xffffffff', type: 'info', instant: true },
]

const POOL_SERIAL = [
  { text: '[    0.000789] Serial: 8250/16550 driver, 4 ports, IRQ sharing enabled', type: 'info', instant: true },
  { text: '[    0.000789] 00:00: ttyS0 at I/O 0x3f8 (irq = 4)', type: 'info', instant: true },
  { text: '[    0.000789] serial8250: ttyS0 at I/O 0x3f8 (irq = 4)', type: 'info', instant: true },
]

const POOL_OPTIONAL_WARNINGS = [
  { text: '[    0.000234] ACPI: No APIC table, using default boot', type: 'warning', instant: true },
  { text: '[    0.000456] audit: type=2006 audit(0.0:1): pid=1 uid=0', type: 'warning', instant: true },
  { text: '[    0.000678] ata1.00: exception Emask 0x0 SAct 0x0 SErr 0x0', type: 'warning', instant: true },
  { text: '[    0.000901] cv0: unknown partition table', type: 'warning', instant: true },
  { text: '[    0.001123] EXT4-fs (cv0): re-mounted. Opts: (null)', type: 'warning', instant: true },
]

export function buildBootLines(siteName) {
  const base = [
    { text: '[    0.000000] Linux version 6.1.0-cv (builder@localhost) #1 SMP PREEMPT', type: 'info', instant: true },
    { text: '[    0.000012] Command line: init=/sbin/init root=/dev/cv0 ro quiet', type: 'info', instant: true },
    { text: '[    0.000045] x86: Booting SMP configuration', type: 'info', instant: true },
    { text: '[    0.000078] KERNEL supported cpus:', type: 'info', instant: true },
    { text: '[    0.000123] Initializing cgroup subsys cpuset', type: 'info', instant: true },
    { text: '[    0.000156] Initializing cgroup subsys cpu', type: 'info', instant: true },
    { text: '[    0.000189] Initializing cgroup subsys cpuacct', type: 'info', instant: true },
    { text: '[    0.000234] Initializing cgroup subsys memory', type: 'info', instant: true },
    { text: '[    0.000267] CPU: CV Engine v2.0 (cv) 2400.000 MHz', type: 'info', instant: true },
    { text: '[    0.000301] Memory: 2048K/4096K available (512K kernel code, 256K rwdata)', type: 'info', instant: true },
    { text: '[    0.000345] Kernel command line: root=/dev/cv0 ro quiet', type: 'info', instant: true },
    { text: '[    0.000378] PID hash table entries: 256 (order: 0, 2048 bytes)', type: 'info', instant: true },
    { text: '[    0.000412] Dentry cache hash table entries: 1024 (order: 0, 4096 bytes)', type: 'info', instant: true },
    { text: '[    0.000456] Inode-cache hash table entries: 512 (order: -1, 2048 bytes)', type: 'info', instant: true },
    { text: '[    0.000489] console [tty0] enabled', type: 'info', instant: true },
    pick(POOL_CLOCKSOURCE),
    { text: '[    0.000567] Calibrating delay loop... 2400.00 BogoMIPS', type: 'info', instant: true },
    { text: '[    0.000601] pid_max: default: 32768 minimum: 301', type: 'info', instant: true },
    { text: '[    0.000645] Security Framework initialized', type: 'info', instant: true },
    { text: '[    0.000678] Mount-cache hash table entries: 256 (order: 0, 4096 bytes)', type: 'info', instant: true },
    { text: '[    0.000712] Mountpoint-cache hash table entries: 256 (order: 0, 4096 bytes)', type: 'info', instant: true },
    { text: '[    0.000756] mq-deadline: io scheduler registered', type: 'info', instant: true },
    pick(POOL_SERIAL),
    { text: '[    0.000867] loop: module loaded', type: 'info', instant: true },
    { text: '[    0.000901] cv0: cv0 (cv)', type: 'info', instant: true },
    { text: '[    0.000934] cv0: p1', type: 'info', instant: true },
    { text: '[    0.000978] cv1: cv1 (cv)', type: 'info', instant: true },
    { text: '[    0.001012] cv1: p1', type: 'info', instant: true },
  ]

  // Insert 0-2 random warning lines at random positions
  const warnings = shuffle(POOL_OPTIONAL_WARNINGS).slice(0, 1 + Math.floor(Math.random() * 2))
  const insertIndex = 12 + Math.floor(Math.random() * 10)
  base.splice(insertIndex, 0, ...warnings)

  const tail = [
    { text: '[    0.001045] Mounting root filesystem...', type: 'info' },
    { text: '[    0.001089] EXT4-fs (cv0): mounted filesystem. Quota mode: none', type: 'success', instant: true },
    { text: '[    0.001123] VFS: Mounted root (ext4 filesystem) on device cv0.', type: 'info', instant: true },
    { text: '[    0.001156] Freeing unused kernel image (rodata/init) memory: 128K', type: 'info', instant: true },
    { text: '[    0.001189] Write protecting kernel read-only data: 256k', type: 'info', instant: true },
    { text: '[    0.001234] Run /sbin/init as init process', type: 'info', instant: true },
    { text: '[    0.001267] Run /sbin/init as init process', type: 'info', instant: true },
    { text: '[    0.001301] init: Loading experience modules', type: 'success' },
    { text: '[    0.001345] init: Loading skills subsystem', type: 'success' },
    { text: '[    0.001378] init: Loading projects database', type: 'success', instant: true },
    { text: '[    0.001412] init: Loading education credentials', type: 'success', instant: true },
    { text: '[    0.001456] init: Loading research publications', type: 'success', instant: true },
    { text: '[    0.001489] NET: Registered protocol family 2', type: 'info', instant: true },
    { text: '[    0.001523] NET: Registered protocol family 10', type: 'info', instant: true },
    { text: '[    0.001567] IPv4: CV protocol initialized', type: 'info', instant: true },
    { text: '[    0.001601] IPv6: CV protocol initialized', type: 'info', instant: true },
    { text: '[    0.001645] NET: Registered protocol family 17', type: 'info', instant: true },
    { text: `[    0.001678] init: Starting ${siteName}...`, type: 'highlight' },
    { text: '[    0.001712] init: CV subsystem ready', type: 'success' },
    { text: '[    0.001756] init: Dev tools initialized', type: 'success', instant: true },
    { text: '[    0.001789] init: Terminal interface online', type: 'success', instant: true },
    { text: '[    0.001823] init: Games subsystem loaded', type: 'success', instant: true },
    { text: '[    0.001867] random: crng init done', type: 'info', instant: true },
    { text: '[    0.001901] systemd[1]: systemd 252 running in system mode', type: 'info', instant: true },
    { text: '[    0.001934] systemd[1]: Detected architecture x86-64', type: 'info', instant: true },
    { text: '[    0.001978] systemd[1]: Set hostname to <cv>', type: 'info', instant: true },
    { text: '[    0.002012] systemd[1]: Created slice system-getty.slice', type: 'info', instant: true },
    { text: '[    0.002045] systemd[1]: Created slice system-systemd\x2dfsck.slice', type: 'info', instant: true },
    { text: '[    0.002089] systemd[1]: Listening on Journal Socket', type: 'info', instant: true },
    { text: '[    0.002123] systemd[1]: Listening on /dev/initctl', type: 'info', instant: true },
    { text: '[    0.002156] systemd[1]: Listening on Journal Socket (/dev/log)', type: 'info', instant: true },
    { text: '[    0.002189] systemd[1]: Reached target Local File Systems', type: 'info', instant: true },
    { text: '[    0.002234] systemd[1]: Reached target Swap', type: 'info', instant: true },
    { text: '[    0.002267] systemd[1]: Reached target System Initialization', type: 'info', instant: true },
    { text: '[    0.002301] systemd[1]: Reached target Basic System', type: 'info', instant: true },
    { text: '[    0.002345] systemd[1]: Reached target Multi-User System.', type: 'success', instant: true },
    { text: '[    0.002378] systemd[1]: Reached target Graphical Interface.', type: 'info', instant: true },
    { text: '[    0.002412] systemd[1]: Startup finished in 2.4s.', type: 'success' },
  ]

  return [...base, ...tail]
}
