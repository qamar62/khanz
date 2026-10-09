from decimal import Decimal

from django.core.management.base import BaseCommand

from reservations.models import MenuCategory, MenuItem, MenuItemOption


CATEGORIES = [
    ('signature-dips', 'Signature Dips', 'House-made dips served for the table.'),
    ('salads-appetizers', 'Salads & Appetizers', 'Fresh salads and generous plates to begin.'),
    ('kids', 'Kids Menu', 'Khanz favourites for younger guests.'),
    ('mains', 'Mains Course', 'Mediterranean, Arabian and Afghan signature plates.'),
    ('non-veg-curries', 'Non-Veg Curries', 'Slow-cooked meat curries with fresh bread or rice.'),
    ('vegetarian', 'Vegetarian', 'Full-flavoured vegetarian house dishes.'),
    ('platters', 'Platters', 'Generous sharing platters for groups.'),
    ('sides', 'Sides', 'Bread, sauces, rice and grill additions.'),
]

# category, code, name, price, description
ITEMS = [
    ('signature-dips','KD1','Muhammara with Bread','12.99','Roasted bell peppers, walnuts, garlic, tomatoes, pomegranate molasses, sumac and fresh bread.'),
    ('signature-dips','KD2','Baba Ghanoush with Bread','12.99','Smoky roasted eggplant, garlic, tahini yoghurt, parsley, onion, tomatoes and fresh bread.'),
    ('signature-dips','KD3','Beetroot with Bread','12.99','Chickpeas, beetroot, tahini, lemon juice, olive oil and fresh bread.'),
    ('signature-dips','KD4','Hummus with Bread','12.99','Chickpeas, tahini, lemon juice, olive oil and fresh bread.'),
    ('signature-dips','KD5','Mixed Herbs Hummus with Bread','12.99','Chickpeas, mint, rosemary, thyme, mixed herbs, tahini, lemon juice, olive oil and fresh bread.'),
    ('signature-dips','KD6','Vegetarian Mezze Platter','29.99','Hummus, baba ghanoush, muhammara, mixed herbs hummus, beetroot hummus, pickles, tabbouleh, vine leaves, olives and two breads.'),
    ('salads-appetizers','KS1','Tabbouleh','16.99','Parsley, onion, tomato, couscous, lemon juice and olive oil dressing.'),
    ('salads-appetizers','KS2','Fattoush','16.99','Cos lettuce, cucumber, tomato, capsicum, onion, lemon juice, zaatar, pomegranate molasses and fried bread.'),
    ('salads-appetizers','KS3','Greek Salad','16.99','Tomato, lettuce, cucumber, onion, capsicum, feta, kalamata olives, oregano and Greek dressing.'),
    ('salads-appetizers','KS4','Fatteh','16.99','Crispy pita, lemon tahini yoghurt, mint, pomegranate, sumac and roasted pine nuts.'),
    ('salads-appetizers','KS5','Eggplant Fatteh','17.99','Crispy pita, fried eggplant, lemon tahini yoghurt, mint, pomegranate, sumac and pine nuts.'),
    ('salads-appetizers','KS6','Falafel Plate (6 pcs)','14.99','Falafel with hummus and fresh bread.'),
    ('salads-appetizers','KS7','Stuffed Vine Leaves (6 pcs)','9.99','Rice-stuffed vine leaves with garlic yoghurt sauce.'),
    ('salads-appetizers','KS8','Fish Tikka','19.99','Boneless fish, ginger, garlic, yoghurt, lemon, chilli, garam masala, kasoori methi and mint sauce.'),
    ('kids','KK1','French Fries','8.99','Shoestring fries with tomato sauce.'),
    ('kids','KK2','Potato Wedges','8.99','Deep-fried potato wedges with tomato sauce.'),
    ('kids','KK3','Fish Bites with Fries','11.99','Deep-fried fish, fries and tomato sauce.'),
    ('kids','KK4','Chicken Nuggets with Chips','11.99','Chicken nuggets, fries and tomato sauce.'),
    ('kids','KK5','Fried Prawns','11.99','Fried prawns, fries and tomato sauce.'),
    ('kids','KK6','Chicken Pasta','13.99','Chicken, parmesan and creamy garlic sauce.'),
    ('kids','KK7','Butter Chicken','14.99','Chicken thigh, aromatic spices, butter sauce and flavoured rice.'),
    ('kids','KK8','Chicken Lollipops (4 pcs)','17.99','Crispy chicken, cheesy cream sauce, butter, garlic, ginger, soy, black pepper, sesame and mashed potato.'),
    ('mains','KM1','Palestinian Maqluba','29.99','Layered basmati rice, roasted vegetables, cinnamon, cardamom, Arabic spices, pine nuts and tzatziki.'),
    ('mains','KM2','Arabian Kofta','27.99','Lamb or chicken mince kofta, mashed potato, tomato gravy, mozzarella and butter.'),
    ('mains','KM3','Marinated Charcoal Chicken Kebab','26.99','Aromatic minced chicken, shark bread, green salad, olive salsa and traditional sauces.'),
    ('mains','KM4','Arabian Chicken Kabsa (Half)','27.99','Roasted chicken, aromatic spices, signature rice, nuts, raisins, green salad and dagous.'),
    ('mains','KM5','Marinated Charcoal Chicken','27.99','Charcoal chicken cubes, mixed herbs, flavoured rice, green salad and sauces.'),
    ('mains','KM6','Tandoori Chicken (Half)','27.99','Charcoal chicken, tandoori herbs, lemon, sauces, green salad and flavoured rice.'),
    ('mains','KM7','Fettuccine Chicken Pasta','25.99','Chicken, mushroom, spinach, capsicum, parmesan and creamy garlic sauce.'),
    ('mains','KM8','Turkish Grilled Chicken Ribs (Nibbles)','27.99','Chicken nibbles, Turkish spices, paprika, tomato paste, yoghurt, sumac, shark bread, vegetables and pickles.'),
    ('mains','KM9','Buffalo Glazed Chicken Lollipops (6 pcs)','25.99','Crispy chicken, buffalo glaze, butter, garlic, ginger, pepper, soy, sesame and mashed potato.'),
    ('mains','KM10','Turkish Adana Kebab','27.99','Lamb mince, Mediterranean spices, capsicum, sumac, tabbouleh, onion salad, tahini and shark bread.'),
    ('mains','KM11','Arabian Beyti Kebab Roll','28.99','Lamb mince, tahini yoghurt, tortilla, tomato gravy, onion, parsley, pine nuts, pickle and vegetables.'),
    ('mains','KM12','Marinated Lamb Sheesh Kebab','27.99','Lamb mince, shark bread, tabbouleh, olive salsa, onion salad and traditional sauces.'),
    ('mains','KM13','Greek Lamb Shank','28.99','Braised lamb shank, tomato gravy, vegetables, garlic, rosemary, thyme, herbs and mashed potato.'),
    ('mains','KM14','Afghani Mantu Bites (10 pcs)','24.99','Steamed lamb or chicken dumplings, tomato-lentil sauce, garlic yoghurt, dry mint and chilli oil.'),
    ('mains','KM15','Lebanese Lamb Crispy Arayes','28.99','Lamb mince, smoked paprika, pomegranate molasses, parsley, pita, tahini yoghurt, tabbouleh and fries.'),
    ('mains','KM16','Marinated Mixed Charcoal','29.99','Lamb cutlet, charcoal chicken cubes, lamb sheesh kebab, flavoured rice, green salad and sauces.'),
    ('mains','KM17','Middle Eastern Stuffed Eggplant Roll','28.99','Lamb mince, roasted eggplant, tomato gravy, pomegranate molasses, parsley, herbs, mozzarella and bread.'),
    ('mains','KM18','Marinated Charcoal Lamb Cutlets (4 pcs)','32.99','Grilled lamb cutlets, tabbouleh, hummus, apricot-capsicum sauce and Turkish pide.'),
    ('mains','KM19','Arabian Laham Mandi','29.99','Slow-cooked lamb, Arabian spices, signature rice, roasted nuts, green salad, dagous and tzatziki.'),
    ('mains','KM20','Arabian Lamb Kabsa','28.99','Roasted lamb shank, herbs, signature rice, nuts, green salad, dagous and tzatziki.'),
    ('mains','KM21','Afghani Kabuli Pulao','28.99','Saffron basmati rice, lamb shank, raisins, sweet carrots, green salad and tzatziki.'),
    ('mains','KM22','Grilled Steak','32.99','Tender steak, mashed potato, roasted vegetables and mushroom sauce.'),
    ('mains','KM23','Harissa Tiger Prawns','27.99','Tiger prawns, olive oil, harissa, garlic butter, green salad and Turkish pide.'),
    ('mains','KM24','Whole Grilled Fish','29.99','Grilled snapper, green salad, fries and traditional sauce.'),
    ('non-veg-curries','KC1','Butter Chicken','26.99','Chicken thigh, aromatic spices, butter sauce and flavoured rice.'),
    ('non-veg-curries','KC2','Authentic Chicken Karahi','27.99','Chicken thigh, spices, ginger, coriander, green chilli, kasoori methi and fresh bread.'),
    ('non-veg-curries','KC3','Afghani Chicken Karahi','27.99','Chicken thigh, cashew gravy, yoghurt, cream, garlic, ginger, tzatziki and fresh bread.'),
    ('non-veg-curries','KC4','Lamb Karahi','28.99','Lamb curry, spices, ginger, coriander, green chilli, kasoori methi and fresh bread.'),
    ('non-veg-curries','KC5','Mutton Nihari','28.99','Slow-cooked lamb shank stew, fresh ginger, coriander and fresh bread.'),
    ('non-veg-curries','KC6','Goat Curry','28.99','Goat, garam masala, garlic, ginger, onion, tomato, yoghurt, mustard oil, coriander and bread.'),
    ('vegetarian','KV1','Dhaal Makhani','23.99','Black lentils, tomato, herbs, cream, butter, kasoori methi and fresh bread.'),
    ('vegetarian','KV2','Paneer Tikka Masala','25.99','Grilled paneer, garlic, ginger, garam masala, yoghurt, cream, capsicum, tomato, coriander and bread.'),
    ('vegetarian','KV3','Karahi Paneer','25.99','Paneer, tomato, onions, ginger, garlic, capsicum, butter, spices and fresh bread.'),
    ('vegetarian','KV4','Grilled Paneer Tikka Shashlik','24.99','Paneer, tandoori spices, cabbage, roasted vegetables, kasoori methi and mint yoghurt.'),
    ('platters','KP1','Khanz Combo Platter (Serves 5)','124.99','Lamb cutlets, adana and lamb sheesh kebabs, chicken kebab, charcoal and spiced chicken, drumsticks, rice, salad, tzatziki and chilli sauce.'),
    ('platters','KP2','Khanz Mixed Charcoal King Platter (Serves 5)','114.99','Lamb cutlets, lamb sheesh kebabs, lamb shank, charcoal and spiced chicken, rice, salad and sauces.'),
    ('platters','KP3','Khanz Charcoal Chicken Platter (Serves 3)','64.99','Chicken sheesh kebab, charcoal and spiced chicken, rice, salad and sauces.'),
    ('platters','KP4','Khanz Mixed Charcoal Platter (Serves 3)','71.99','Lamb cutlets, lamb sheesh kebabs, charcoal chicken, rice, salad and sauces.'),
    ('platters','KP5','Khanz Afghani Chicken Karahi Platter (Serves 3)','64.99','Chicken thigh, cashew gravy, yoghurt, cream, garlic, ginger, kasoori methi, tzatziki and bread.'),
    ('platters','KP6','Khanz Chicken Karahi Platter (Serves 3)','64.99','Chicken thigh, herbs, spices, ginger, kasoori methi, coriander, tzatziki and bread.'),
    ('platters','KP7','Khanz Lamb Karahi Platter (Serves 3)','68.99','Lamb curry, herbs, spices, ginger, coriander, kasoori methi, green chilli, tzatziki and bread.'),
    ('platters','KP8','Khanz Seafood Platter (Serves 3)','79.99','Two grilled snappers, grilled prawns, crab, salad, sauces and flavoured rice.'),
    ('sides','KSD1','Plain Bread','3.49',''), ('sides','KSD2','Butter Bread','3.99',''),
    ('sides','KSD3','Garlic Bread','4.49',''), ('sides','KSD4','Tzatziki','6.99',''),
    ('sides','KSD5','Garlic Sauce','6.99',''), ('sides','KSD6','Red Chili Sauce','6.99',''),
    ('sides','KSD7','Hummus','8.99',''), ('sides','KSD8','Baba Ghanoush','8.99',''),
    ('sides','KSD9','Muhammara','8.99',''), ('sides','KSD10','Beetroot Hummus','8.99',''),
    ('sides','KSD11','Mixed Herbs Hummus','8.99',''), ('sides','KSD12','Any Charcoal Chicken','21.00',''),
    ('sides','KSD13','Flavoured Rice','5.99',''), ('sides','KSD14','Afghani Kabuli Rice','5.99',''),
    ('sides','KSD15','Lamb Shank','20.00',''), ('sides','KSD16','Lamb Cutlet','7.99',''),
    ('sides','KSD17','Chicken Sheesh Kebab','18.00',''), ('sides','KSD18','Any Lamb Sheesh Kebab','20.00',''),
]

OPTIONS = {
    **{code: [('Add lamb', '6.00'), ('Add chicken', '6.00')] for code in ['KD1', 'KD2', 'KD3', 'KD4', 'KD5']},
    'KM1': [('Lamb', '0.00'), ('Chicken (half)', '0.00')],
    'KM2': [('Lamb', '0.00'), ('Chicken', '0.00')],
    'KM14': [('Lamb', '0.00'), ('Chicken', '0.00')],
}


class Command(BaseCommand):
    help = 'Seed normalized menu categories and items transcribed from the August 2026 menu.'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Update existing seeded records as well.')
        parser.add_argument('--deactivate-missing', action='store_true')

    def handle(self, *args, **options):
        if MenuItem.objects.exists() and not options['force']:
            self.stdout.write(self.style.WARNING(
                'Menu items already exist; nothing changed. Use --force only when you intend to overwrite seeded fields.'
            ))
            return
        categories = {}
        for order, (slug, name, description) in enumerate(CATEGORIES):
            category, _ = MenuCategory.objects.update_or_create(
                slug=slug,
                defaults={'name': name, 'description': description, 'display_order': order, 'is_active': True},
            )
            categories[slug] = category

        seeded_codes = []
        per_category_order = {}
        for category_slug, code, name, price, description in ITEMS:
            order = per_category_order.get(category_slug, 0)
            per_category_order[category_slug] = order + 1
            item, _ = MenuItem.objects.update_or_create(
                code=code,
                defaults={
                    'category': categories[category_slug], 'name': name,
                    'description': description, 'price': Decimal(price),
                    'display_order': order, 'is_active': True,
                    'is_popular': code in {'KD6', 'KM1', 'KC1', 'KP1'},
                    'is_chef_special': code in {'KM18', 'KM19', 'KP2'},
                    'dietary_labels': ['vegetarian'] if category_slug == 'vegetarian' else [],
                },
            )
            seeded_codes.append(code)
            MenuItemOption.objects.filter(item=item).delete()
            for option_order, (option_name, additional_price) in enumerate(OPTIONS.get(code, [])):
                MenuItemOption.objects.create(
                    item=item, name=option_name, additional_price=Decimal(additional_price),
                    display_order=option_order,
                )

        if options['deactivate_missing']:
            MenuItem.objects.exclude(code__in=seeded_codes).update(is_active=False)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(categories)} categories and {len(seeded_codes)} menu items.'))
