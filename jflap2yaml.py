#!/usr/bin/env python3
import sys
import xml.etree.ElementTree as ET
import yaml
import zipfile
from pathlib import Path
import json


def parse_dfa(root):
    aut, = root.iter("automaton")
    start_state = None
    accepted_states = []
    edges = []
    for entry in aut:
        if entry.tag == 'state':
            if entry.find('initial') is not None:
                assert start_state is None
                start_state = entry.attrib['id']
            if entry.find('final') is not None:
                accepted_states.append(entry.attrib['id'])
        elif entry.tag == 'transition':
            edges.append(
                dict(
                    src=entry.find('from').text,
                    dst=entry.find('to').text,
                    char=entry.find('read').text,
                )
            )
    assert start_state is not None
    return dict(
        start_state=start_state,
        accepted_states=accepted_states,
        edges=edges
    )


def parse_npda(root):
    aut, = root.iter("automaton")
    start_state = None
    accepted_states = []
    edges = []
    for entry in aut:
        if entry.tag == 'state':
            if entry.find('initial') is not None:
                assert start_state is None
                start_state = entry.attrib['id']
            if entry.find('final') is not None:
                accepted_states.append(entry.attrib['id'])
        elif entry.tag == 'transition':
            edges.append(
                dict(
                    src=entry.find('from').text,
                    dst=entry.find('to').text,
                    char=entry.find('read').text,
                    pop=entry.find('pop').text,
                    push=entry.find('push').text,
                )
            )
    assert start_state is not None
    return dict(
        start_state=start_state,
        accepted_states=accepted_states,
        edges=edges
    )


def parse_zip(zf, npda=False):
    if npda:
        for fname in zf.infolist():
            if not fname.is_dir() and fname.filename.endswith('.jff'):
                root = ET.fromstring(zf.read(fname))
                yield fname.filename, parse_npda(root)
    else:
        for fname in zf.infolist():
            if not fname.is_dir() and fname.filename.endswith('.jff'):
                root = ET.fromstring(zf.read(fname))
                yield fname.filename, parse_dfa(root)


def load_from_zip(filename, npda=False):
    with zipfile.ZipFile(filename, "r") as zf:
        return dict((Path(p).stem, dfa) for p, dfa in parse_zip(zf))


def load_from_list(filenames, npda=False):
    result = dict()
    if npda:
        for filename in filenames:
            result[Path(filename).stem] = parse_npda(ET.parse(filename).getroot())
    else:
        for filename in filenames:
            result[Path(filename).stem] = parse_dfa(ET.parse(filename).getroot())
    return result


def main():
    import argparse
    import sys
    parser = argparse.ArgumentParser()
    # add flags to parse from dfa or npda
    parser.add_argument('--npda', action='store_true')
    parser.add_argument("-o",
                        dest="output",
                        nargs='?',
                        type=argparse.FileType('w'),
                        default=sys.stdout
                        )
    parser.add_argument("-j", dest="json", action="store_true")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('-z',
                       dest="from_zip",
                       metavar="FILE_ZIP",
                       help="Create a YAML file from a ZIP file."
                       )
    group.add_argument('-f',
                       dest="from_files",
                       metavar='FILE_JFF',
                       nargs="+",
                       help="Create a YAML file from multiple JFLAP files."
                       )

    args = parser.parse_args()
    if args.from_zip is not None:
        data = load_from_zip(args.from_zip, npda=args.npda)
    else:
        data = load_from_list(args.from_files, npda=args.npda)
    if args.json:
        json.dump(data, args.output)
    else:
        yaml.dump(data, args.output)


if __name__ == '__main__':
    main()

# yaml.dump(parse_dfa('ex1.jff'), sys.stdout)
